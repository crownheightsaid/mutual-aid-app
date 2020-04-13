// P2P money orchestrates payments directly from donors to reimburse expenditures benefiting PINs (People in Need)
// Full Spec: https://docs.google.com/document/d/1kp9H4LLBAS6M-TpQkBd86rMYy7wuWJTxOK2gSc9KBuw/edit

const Airbase = require("../airtable");
const PaymentSMS = require("./payment-sms");
const PendingPayments = require("./pending-payments");

module.exports = {
  // Accepts each changed record from ChangeDetector (polling)
  // and sends them wherever they need to go
  processChangedRecord(record) {
    // NEW REQUEST
    if (isNewPaymentRequest(record)) {
      newPaymentRequest(record);

      // MOD APPROVED
    } else if (isNewModApproval(record)) {
      newModApproval(record);

      // NEW DONOR
    } else if (isNewDonor(record)) {
      newDonor(record);
    }
  },

  // Incoming from twilio (via API payment code handler)
  // handles incoming payment codes, treats as claims that payment was sent/not sent/received/not received
  processSMSPaymentCode(donorPayment, code, senderTel) {
    PendingPayments.processReceivedCode(donorPayment, code, senderTel);
  },

  // Every unfinished payment can be run through this on a schedule to trigger actions as needed
  processPendingPayment(donorPayment) {
    PendingPayments.processWithSchedule(donorPayment);
  }
};

//
// Checks for record states
//
// Notes:
// - "new record" checks here assume records were entered via airtable forms, which will set created/updated timestamps equal
//   (in other circumstances, a new record won't necessarily fit this profile)
//
function isNewPaymentRequest(record) {
  return (
    record.getTableName == "PaymentRequests" &&
    record.get("Last Modified") == record.get("Created")
  );
}

function isNewModApproval(record) {
  return (
    record.getTableName == "PaymentRequests" &&
    record.didChange("Approval") &&
    record.get("Approval") == "Approved"
  );
}

function isNewDonor(record) {
  return (
    record.getTableName == "Donors" &&
    record.get("Last Modified") == record.get("Created")
  );
}

//
// actions for record states
//

function newPaymentRequest(record) {
  console.debug(
    `New Payment Request: ${record.get("ID")}  |  ${record.get(
      "FirstName"
    )}  |  ${record.get("Amount")}  |  ${record.get("Created")}`
  );

  // TODO
  // Send slack notification to kanban board for approving payment requests
}

function newModApproval(record) {
  console.debug(
    `New Mod Payment Request Approval: ${record.get("ID")}  |  ${record.get(
      "FirstName"
    )}  |  ${record.get("Amount")}  |  ${record.get("Created")}`
  );

  // TODO
  // Send slack message (and others?) announcing the need for reimbursement
}

function newDonor(record) {
  console.debug(
    `New Donor: ${record.get("ID")}  |  ${record.get(
      "FirstName"
    )}  |  ${record.get("Amount")}  |  ${record.get("Created")}`
  );

  const {
    paymentRequests,
    message
  } = Airbase.findReimbursablePaymentRequests();
  console.debug(paymentRequests);

  if (paymentRequests == null) {
    const { balancer, balancerMessage } = Airbase.findBalancer(
      record.get("PaymentMethod")
    );
    if (balancer != null) {
      PaymentSMS.balancerForDonor(record.get("Mobile"), balancer);
    } else {
      PaymentSMS.cannotAcceptDonation(record.get("Mobile"));
    }
  } else {
    const payments = createPayments(record, paymentRequests);
    PaymentSMS.paymentsForDonor(payments);
  }
}

function createPayments(donor, paymentRequests) {
  let remaining = donor.get("Amount");
  const donorPayments = [];
  for (const request in paymentRequests) {
    // bail early if we're done, else set the amount and reduce the remaining
    if (remaining <= 0) {
      break;
    }
    const amount = Math.Min(
      donor.get("Amount"),
      request.get("ReimbursementAmount")
    );
    remaining -= amount;

    // create the payment record in airtable
    const payment = {
      Donor: donor.get("ID"),
      "Payment Request": request.get("ID"),
      Amount: amount,
      Code: generateCode(),
      "Donor Confirmation": "Pending",
      "Recipient Confirmation": "Pending",
      Status: "Pending"
    };
    Airbase.createDonorPayment(payment);
    payments << payment;
  }

  return payments;
}

function generateCode() {
  const length = 4;
  const chars = "BCDFGHJKLMNPQRSTVWXYZ";

  let result = "";
  for (let i = length; i > 0; --i)
    result += chars[Math.floor(Math.random() * chars.length)];
  return result;
}

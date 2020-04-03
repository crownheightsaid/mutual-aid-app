// P2P money orchestrates payments directly from donors to reimburse expenditures benefiting PINs (People in Need)
// Full Spec: https://docs.google.com/document/d/1kp9H4LLBAS6M-TpQkBd86rMYy7wuWJTxOK2gSc9KBuw/edit


const Airbase = require("../airtable");

module.exports = {

  // Accepts each changed record from ChangeDetector (polling)
  // and sends them wherever they need to go
  processChangedRecord: function(record) {

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
  processSMSPaymentCode: function(record, code, senderTel) {

    // todo receive payment code business logic, as per spec
  },
};

//
// Checks for record states
//
// Notes:
// - "new record" checks here assume records were entered via airtable forms, which will set created/updated timestamps equal
//   (in other circumstances, a new record won't necessarily fit this profile)
//
function isNewPaymentRequest(record) {
  return record.getTableName == "PaymentRequests"
         && record.get("Last Modified") == record.get("Created");
};

function isNewModApproval(record) {
  return record.getTableName == "PaymentRequests"
         && record.didChange("Approval")
         && record.get("Approval") == "Approved";
};

function isNewDonor(record) {
  return record.getTableName == "Donors"
         && record.get("Last Modified") == record.get("Created");
};



//
// actions for record states
//

function newPaymentRequest(record) {
  console.debug(`New Payment Request: ${record.get("ID")}  |  ${record.get("First Name")}  |  ${record.get("Amount")}  |  ${record.get("Created")}`);

  // TODO
  // Send slack notification to kanban board for approving payment requests
};


function newModApproval(record) {
  console.debug(`New Mod Payment Request Approval: ${record.get("ID")}  |  ${record.get("First Name")}  |  ${record.get("Amount")}  |  ${record.get("Created")}`);

  // TODO
  // Send slack message (and others?) announcing the need for reimbursement
};


function newDonor(record) {
  console.debug(`New Donor: ${record.get("ID")}  |  ${record.get("First Name")}  |  ${record.get("Amount")}  |  ${record.get("Created")}`);

  // TODO
  // Divide up the payment
  // Create DonorPayment records
  // Text the donor the payments to send
};






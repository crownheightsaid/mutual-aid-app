// Scheduled checks on payment statuses

module.exports = {
  processReceivedCode(payment, code, senderTel) {
    if (
      senderTel != payment.get("PayerMobile") &&
      senderTel != payment.get("PayeeMobile")
    ) {
      throw new Error(
        "Sender phone # is not associated with the payment specified."
      );
    }

    const isPayee = senderTel != payment.payerMobile;
    // map these for legibility
    const response = mapCodeToResponse(code);

    if (isPayee) {
      // is runner or receiving balancer
      switch (response) {
        case "yes":
          // Consider finalized - Update status to Completed
          break;
        case "no":
          // Txt donor follow up (“Roger indicated that they have not received a venmo from you yet. If you can, please {venmo instructions}. If you are sure that you have already sent this, please respond to this message with “XYZB”. If you are unable to complete this donation, please respond with “!XYZB” (exclamation mark in front) so we can have someone else’s donation cover this expense. Thank you!”
          // Update status to PendingDonorMessaged
          break;
        case "wait":
          // shouldn't happen, consider sending back a "that didn't make any sense" and the full instructions again
          break;
      }
    } else {
      // is paying donor or sending balancer
      switch (response) {
        case "yes":
          // Donor says they sent
          // Text runner to either confirm they received or visit {link} to dispute -- link should be to Disputes form, prefilled with donor payment ID
          // Update status to DisputePendingNotes
          break;
        case "no":
          // Donor not going to send
          // Update status to failed
          // Payment is re-enqueued
          break;
        case "wait":
          // Change status to Pending, will automatically re-text runner in another X minutes
          break;
      }
    }
  },

  processPendingPayment(pmt) {
    const minutesOld = Date.now() - new Date(pmt.get("Created")) / (1000 * 60);
    const status = pmt.get("Status");

    if (status == "Pending" && minutesOld > 30) {
      // Txt runner, ask if they’ve received
      // Update status to PendingRecipientMessaged
    } else if (status == "PendingRecipientMessaged" && minutesOld > 60 * 24) {
      // (i.e. no response from runner)
      // Consider finalized - Update status to Completed
    } else if (status == "PendingRecipientMessaged" && minutesOld > 60 * 24) {
      // (i.e. no response from donor after runner said they weren’t paid)
      // OPEN: assume not paid? Or follow up with runner one last time?
    }
  }
};

function mapCodeToResponse(code) {
  if (code[0] == "!") {
    return "no";
  }
  if (code[0] == "$") {
    return "wait";
  }
  return "yes";
}

// Scheduled checks on payment statuses

module.exports = {

  processReceivedCode: function(payment, code, senderTel) {
    if (senderTel != payment.PayerMobile && senderTel != payment.PayeeMobile) {
      throw new Error("Sender phone # is not associated with the payment specified.");
    }

    const isPayer = senderTel == payment.payerMobile;

    // TODO
    // “Code” => `XYZZ`
    // “!Code” => `!XYZZ`
    // Code from runner
    // - Consider finalized - Update status to Completed
    // !Code from runner
    // - Txt donor follow up (“Roger indicated that they have not received a venmo from you yet. If you can, please {venmo instructions}. If you are sure that you have already sent this, please respond to this message with “XYZB”. If you are unable to complete this donation, please respond with “!XYZB” (exclamation mark in front) so we can have someone else’s donation cover this expense. Thank you!”
    // - Update status to PendingDonorMessaged
    // Code from donor
    // - Donor says they sent
    // - Text runner to either confirm they received or visit {link} to dispute -- link should be to Disputes form, prefilled with donor payment ID
    // - Update status to DisputePendingNotes
    // !Code from donor
    // - Donor not going to send
    // - Update status to failed
    // - Payment is re-enqueued

  },

  processPendingPayment: function(payment) {
    // TODO
    // Pending && {30} minutes
    // - Txt runner, ask if they’ve received
    // - Update status to PendingRecipientMessaged
    // PendingRecipientMessaged && {24 hours} (i.e. no response from runner)
    // - Consider finalized - Update status to Completed
    // PendingDonorMessaged && 24 hours (i.e. no response from donor after runner said they weren’t paid)
    // - OPEN: assume not paid? Or follow up with runner one last time?

  }

};
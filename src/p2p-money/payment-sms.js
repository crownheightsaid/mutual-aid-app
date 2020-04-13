// Outgoing Twilio messages for P2P Money

module.exports = {
  // Thank you for your Venmo donation of $30 for Crown Heights Mutual Aid!
  // We need your donation in in two parts. Please send $20 to @SteveHarrington (groceries delivered), and include the payment code XYZB.
  // Please send the remaining $10 to @NancyWheeler (groceries delivered), and include the payment code XYZC.
  // We may follow up via text a little later to confirm.
  paymentsForDonor(phone, payments) {},

  // Thank you for your Venmo donation of $30 for Crown Heights Mutual Aid!
  // Please send the $30 to @NancyWheeler (reimbursement for various expenses), and include the payment code XYZB.
  // We may follow up via text a little later to confirm.
  balancerForDonor(phone, payment) {},

  // Thank you for your offer to donate $30 to Crown Heights Mutual Aid!
  // Unfortunately, there is nobody who can accept your donation right now.
  // {NEED DISCUSSION OF WHAT TO DO, LOW PRIORIRTY, HOPEFULLY WILL NEVER HAPPEN}
  cannotAcceptDonation(phone) {},

  // You should have received a payment for $20 with code `XYZB` as a reimbursement for job #1234.
  // If you have, please respond `XYZB` to this message.
  // If you have not, please respond `!XYZB` so we can follow up with the donor. Thank you!
  recipientConfirmation(phone, payment) {},

  // @SteveHarrington said they have not received your Venmo donation of $20 with code XYZB.
  // If you sent this but may have forgotten to include the code XYZB for reference, please respond with `XYZB`
  // If you didn't send it yet but will be able to send it now, please respond with `$XYZB`
  // If you did not send this and will not send it, please respond with `!XYZB` so we can have another donor reimburse them for the expenses.
  // Thank you!
  donorConfirmation(phone, payment) {}
};

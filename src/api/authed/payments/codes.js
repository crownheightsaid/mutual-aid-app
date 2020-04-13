const Airbase = require("../../../airtable.js");
const P2pMoney = require("./../../../p2p-money/p2p-money");

// Consumes payment codes sent from donors/recipients via twilio
// hands off to p2p money business logic to update payment status

// POST params     --> is there somewhere we're supposed to enforce or document these?
// - code: twilio expects this short alpha code is probably a valid payment code
// - tel:  sender mobile #

// note that code may be prefixed (e.g. `!`), we look up without this, but retain the original and pass it on to handling logic

exports.paymentCodeHandler = async (req, res, next) => {

  if (!isSMSPaymentCode(req.body.code)) {

    const err = new Error("Payment could not be found; code does not match expected format"); // TODO once formats are final, consider instructions "please ensure code is 4 letters, optionally beginning with..."
    err.statusCode = 404;
    return next(err);
  }

  const { record, message } = Airbase.findDonorPaymentByCode(rawCode(req.body.code));

  if (record == null) {
    const err = new Error(message);
    err.statusCode = 404;
    return next(err);
  } else if (req.tel != record.PayerMobile && req.tel != record.PayeeMobile) {
    const err = new Error("A payment could not be found that matches both the code and sender's phone #."); // TODO consider improvements as above, also consider checking for phone # and resending any instructions
    err.statusCode = 404;
    return next(err);
  }

  P2pMoney.processSMSPaymentCode(record, req.body.code, req.tel);
  res.sendStatus(200);
}

// todo also check this is letters only and no vowels for max safety
// this could be improved a lot, I'm bad at js :/
function isSMSPaymentCode(str) {
  return typeof str === 'string' || str instanceof String  // sorry stackoverflow told me this is the best way to do string checks I have no idea
         && (
          (string.length == 4 && string[0] != "!" && string[0] != "$")
          || (string.length == 5 && (string[0] == "!" || string[0] == "$")
         );
};

function rawCode(str) {
  // todo possibly naiive slicing, consider checking for actual letters
  return str[0] == "!" || str[0] == "$" ? str.slice(1, 4).toUpperCase() : str.toUpperCase();
}


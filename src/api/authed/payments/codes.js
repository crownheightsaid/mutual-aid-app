const Airbase = require("../../../airtable.js");
const P2pMoney = require("./../../../p2p-money/p2p-money");

// Consumes payment codes sent from donors/recipients via twilio
// hands off to p2p money business logic to update payment status

// POST params     --> is there somewhere we're supposed to enforce or document these?
// - code: twilio expects this short alpha code is probably a valid payment code
// - tel:  sender mobile #

exports.paymentCodeHandler = async (req, res, next) => {

  if (!isSMSPaymentCode(req.body.code)) {

    const err = new Error("Code does not match expected format");
    err.statusCode = 404;
    return next(err);
  }

  const { record, errMessage } = Airbase.findPaymentByCode(req.code);

  if (record == null) {
    const err = new Error(errMessage);
    err.statusCode = 404;
    return next(err);
  }

  P2pMoney.processSMSPaymentCode(record, req.body.code, req.tel);
  res.sendStatus(200);
}


function isSMSPaymentCode(str) {
  return typeof str === 'string' || str instanceof String  // sorry stackoverflow told me this is the best way to do string checks I have no idea
         && (
          (string.length == 4 && string[0] != "!")
          || (string.length == 5 && string[0] == "!")
         );
  // todo also check this is letters only and no vowels for max safety
};


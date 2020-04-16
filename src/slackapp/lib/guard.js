const slackapi = require("../../slackapi");
const { errorView } = require("../views");
/**
 * Guards a slack callback handler presenting an error response if there is an error.
 */
module.exports = f => {
  return (payload, ...args) => {
    return f(payload, ...args).catch(e => {
      console.error("Got error when processing: %0", e);
      return slackapi.views.open({
        trigger_id: payload.trigger_id,
        view: errorView(`Oops got an error: ${e}`)
      });
    });
  };
};

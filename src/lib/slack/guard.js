const { str } = require("~strings/i18nextWrappers");
const slackapi = require("~slack/webApi");
const { errorView } = require("~slack/views");
/**
 * Guards a slack callback handler presenting an error response if there is an error.
 */
module.exports = (f) => {
  return (payload, ...args) => {
    return f(payload, ...args).catch((e) => {
      console.error("Got error when processing: %0", e);
      return slackapi.views.open({
        trigger_id: payload.trigger_id,
        view: errorView(`${str("slackapp:modal.error.defaultMessage")}: ${e}`),
      });
    });
  };
};

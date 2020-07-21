const slackapi = require("~slack/webApi");

module.exports.getSlackIdForEmail = async email => {
  if (!email) {
    return [null, "No email provided to getSlackIdForEmail."];
  }
  try {
    const result = await slackapi.users.lookupByEmail({
      email
    });
    if (!result.ok) {
      throw new Error(result.error);
    }
    return [result.user.id, null];
  } catch (e) {
    e.message = `Couldn't find slackId for Email. ${e.message}`;
    return [null, e];
  }
};

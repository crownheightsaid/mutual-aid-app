const slackapi = require("~slack/webApi");
const { TECH_CHANNEL } = require("~slack/constants");
const { findChannelByName } = require("~slack/channels");

const sentErrors = [];

module.exports = async function sendErrorNotification(error) {
  /**
   *
   */
  const now = new Date();

  const twoHoursAgo = new Date(now.getTime() - 120 * 60000);

  let shouldSend = true;

  for (const sentError of sentErrors) {
    // dont send if error occured within last 2 hours
    if (
      sentError[0] === error.message &&
      sentError[1].getTime() > twoHoursAgo.getTime()
    ) {
      shouldSend = false;
    }
  }

  if (shouldSend) {
    let errText = `${error.stack}`;
    errText = `<!here|here> - We've got an error!\n\`\`\`${errText}\`\`\``;

    const wgTechChannel = await findChannelByName(TECH_CHANNEL);
    await slackapi.chat.postMessage({
      channel: wgTechChannel.id,
      text: errText
    });

    sentErrors.push([error.message, now]);
  }
};

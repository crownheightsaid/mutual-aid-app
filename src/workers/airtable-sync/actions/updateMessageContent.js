const slackapi = require("../../../slackapi");

const mappings = {
  "Delivery Assigned": ":ballot_box_with_check: REQUEST ASSIGNED",
  "Request Complete": ":white_check_mark:  REQUEST COMPLETED"
};

/**
 * Updates the slack delivery-request message to account for changes
 * in the Request.
 * Right now this handles:
 *  - Delivery slackid: Will add a shout-out to the delivering volunteer
 *  - Status: will change the status emoji
 */
module.exports = async function updateMessageContent(record) {
  /* eslint dot-notation: ["error", { "allowPattern": "^[a-z]+(_[a-z]+)+$" }] */
  const meta = record.getMeta();
  if (!meta["slack_ts"]) {
    return;
  }
  const existingMessage = await getExistingMessage(
    meta.slack_ts,
    meta.slack_channel
  );

  if (existingMessage == null) {
    return;
  }
  const content = existingMessage.text;

  // Set up the status emoji/phrase
  // HACK: use non-breaking space as a delimiter between the status and the rest of the message: \u00A0
  const statusBadge = getStatusBadge(record);
  const contentWithoutStatus = content.replace(/.*\u00A0/, "");
  let newContent = `${statusBadge}\u00A0${contentWithoutStatus}`;

  // Shout-out the delivery volunteer if applicable
  const deliveryVolunteer = record.get("Delivery slackid");
  const shoutOutPattern = /Shout out to <@.*?>/;
  if (!newContent.match(shoutOutPattern) && deliveryVolunteer) {
    newContent += `\n:tada:Shout out to <@${deliveryVolunteer}> for volunteering to help!`;
  }

  console.log(
    `${record.get("Code")} now ${record.get("Status")} => ${statusBadge}`
  );
  await slackapi.chat.update({
    channel: meta["slack_channel"],
    ts: meta["slack_ts"],
    text: newContent
  });
};

function getStatusBadge(record) {
  const status = record.get("Status");
  if (mappings[status]) {
    return mappings[status];
  }
  return ":red_circle:";
}

async function getExistingMessage(ts, channel) {
  const message = await slackapi.conversations.history({
    channel,
    latest: ts,
    limit: 1,
    inclusive: true
  });
  if (!message.messages[0]) {
    return null;
  }
  return message.messages[0];
}

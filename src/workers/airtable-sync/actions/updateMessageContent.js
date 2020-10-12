const slackapi = require("~slack/webApi");
const { getExistingMessage } = require("~slack/channels");
const { fields: requestFields } = require("~airtable/tables/requestsSchema");
const { str } = require("~strings/i18nextWrappers");

const mappings = {
  [requestFields.status_options.deliveryAssigned]: str(
    "slackapp:requestBotPost.post.statusPrefix.assigned",
    ":white_check_mark: REQUEST ASSIGNED\n"
  ),
  [requestFields.status_options.requestComplete]: str(
    "slackapp:requestBotPost.post.statusPrefix.completed",
    ":heavy_check_mark:  REQUEST COMPLETED\n"
  ),
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
    console.log(
      `No existing message for code: ${record.get(requestFields.code)}`
    );
    return;
  }
  const content = existingMessage.text;

  // Set up the status emoji/phrase
  // HACK: use non-breaking space as a delimiter between the status and the rest of the message: \u00A0
  const statusBadge = getStatusBadge(record);
  const contentWithoutStatus = content.replace(/^(.|[\r\n])*\u00A0/, "");
  let newContent = `${statusBadge}\u00A0${contentWithoutStatus}\n`;

  // Shout-out the delivery volunteer if applicable
  const deliveryVolunteer = record.get(requestFields.deliverySlackId);
  if (
    deliveryVolunteer &&
    !contentWithoutStatus.includes(`${deliveryVolunteer}`)
  ) {
    newContent += str("slackapp:requestBotPost.post.deliveryCongrats", {
      defaultValue: `:tada: Shout out to {{- deliveryVolunteer}} for volunteering to help! :tada:\n`,
      deliveryVolunteer: `<@${deliveryVolunteer}>`,
    });
  }

  console.log(
    `${record.get(requestFields.code)} now ${record.get(
      requestFields.status
    )} => ${statusBadge}`
  );

  if (deliveryAssigned(record)) {
    newContent = removeMapLink(newContent);
  }

  await slackapi.chat.update({
    channel: meta["slack_channel"],
    ts: meta["slack_ts"],
    text: newContent,
  });
};

function getStatusBadge(record) {
  const status = record.get(requestFields.status);
  if (mappings[status]) {
    return mappings[status];
  }
  return str(
    "slackapp:requestBotPost.post.statusPrefix.default",
    ":red_circle:"
  );
}

function deliveryAssigned(request) {
  return (
    request.get(requestFields.status) ===
    requestFields.status_options.deliveryAssigned
  );
}

function removeMapLink(messageText) {
  const streetsLineHeading = `*${str(
    "slackapp:requestBotPost.post.fields.streets.name",
    "Cross Streets"
  )}*`;
  const linkRegex = /<http.*\|(.+)>/;

  return messageText
    .split("\n")
    .map((line) => {
      if (line.startsWith(streetsLineHeading)) {
        if (line.match(linkRegex)) {
          return line.replace(linkRegex, "$1");
        }
        return null;
      }

      return line;
    })
    .filter((line) => line !== null)
    .join("\n");
}

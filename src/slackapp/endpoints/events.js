const { createEventAdapter } = require("@slack/events-api");
const onReimbursementReply = require("../event-listeners/reimbursementReply");
const onOpenHome = require("../event-listeners/homeOpened");

const slackEvents = createEventAdapter(process.env.SLACK_SIGNING_SECRET);

slackEvents.on("error", console.error);

onOpenHome.register(slackEvents);
onReimbursementReply.register(slackEvents);

module.exports = slackEvents.requestListener();

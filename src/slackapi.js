const { WebClient } = require("@slack/web-api");

if (!process.env.SLACK_BOT_TOKEN) {
  console.warn(
    "No Slack signing secret. You can still import Slack API, but it will fail on method calls."
  );
}

// An object with the methods listed at https://api.slack.com/methods. Ex:
// const slackApi = require("..../slackapi.js");
// ...
// slackApi.views.publish({token: ...., user_id: ...., view: ....})
module.exports = process.env.SLACK_BOT_TOKEN
  ? new WebClient(process.env.SLACK_BOT_TOKEN)
  : null;

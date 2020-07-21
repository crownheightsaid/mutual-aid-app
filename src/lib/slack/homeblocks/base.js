const { str } = require("~strings/i18nextWrappers");

module.exports = [
  {
    type: "section",
    text: {
      type: "mrkdwn",
      text: str("slackapp:home.base.welcome")
    }
  },
  {
    type: "actions",
    elements: [
      {
        type: "button",
        text: {
          type: "plain_text",
          text: str("slackapp:home.base.welcomeDocButton.text")
        },
        url: str("slackapp:home.base.welcomeDocButton.url"),
        action_id: "welcome-link"
      }
    ]
  }
];

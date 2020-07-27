const { str } = require("~strings/i18nextWrappers");

module.exports = [
  {
    type: "section",
    text: {
      type: "mrkdwn",
      text: str("slackapp:home.volunteerSignUp.message"),
    },
  },
  {
    type: "actions",
    elements: [
      {
        type: "button",
        text: {
          type: "plain_text",
          text: str("slackapp:home.volunteerSignUp.formButton.text"),
        },
        url: str("slackapp:home.volunteerSignUp.formButton.url"),
        action_id: "volunteer-form",
      },
    ],
  },
  {
    type: "section",
    text: {
      type: "mrkdwn",
      text: str("slackapp:home.volunteerSignUp.errorMessage"),
    },
  },
];

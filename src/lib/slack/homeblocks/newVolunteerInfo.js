const { str } = require("~strings/i18nextWrappers");

module.exports = [
  {
    type: "section",
    text: {
      type: "mrkdwn",
      text: str(`slackapp:home.newVolunteer.message`),
    },
  },
  {
    type: "actions",
    elements: [
      {
        type: "button",
        text: {
          type: "plain_text",
          text: str(`slackapp:home.newVolunteer.trainingButton.text`),
        },
        url: str(`slackapp:home.newVolunteer.trainingButton.url`),
        action_id: "volunteer-training",
      },
    ],
  },
];

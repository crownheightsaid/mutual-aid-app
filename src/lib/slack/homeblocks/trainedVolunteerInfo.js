const { str } = require("~strings/i18nextWrappers");

module.exports = [
  {
    type: "section",
    text: {
      type: "mrkdwn",
      text: str("slackapp:home.trainedVolunteer.message"),
    },
  },
  {
    type: "actions",
    elements: [
      {
        type: "button",
        text: {
          type: "plain_text",
          text: str("slackapp:home.trainedVolunteer.shiftSignUpButton.text"),
        },
        url: str("slackapp:home.trainedVolunteer.shiftSignUpButton.url"),
        action_id: "volunteer-shifts",
      },
    ],
  },
  {
    type: "actions",
    elements: [
      {
        type: "button",
        text: {
          type: "plain_text",
          text: str("slackapp:home.trainedVolunteer.intakeGuideButton.text"),
        },
        url: str("slackapp:home.trainedVolunteer.intakeGuideButton.url"),
        action_id: "volunteer-guide",
      },
    ],
  },
];

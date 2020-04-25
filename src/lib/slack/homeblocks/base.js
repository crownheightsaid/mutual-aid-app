const { str } = require("~strings/i18nextWrappers");

module.exports = [
  {
    type: "section",
    text: {
      type: "mrkdwn",
      text: str(
        "slackapp:home.base.welcome",
        "Welcome to Crown Heights Mutual Aid Slack!\n\nCheck out the quick welcome doc below.\nIt's made with love by neighbors in this Slack 🎉🎉🎉"
      )
    }
  },
  {
    type: "actions",
    elements: [
      {
        type: "button",
        text: {
          type: "plain_text",
          text: str("slackapp:home.base.welcomeDocButton.text", "Welcome Doc")
        },
        url: str(
          "slackapp:home.base.welcomeDocButton.url",
          "https://docs.google.com/document/d/14eV4UuY1Z78GJ_eRM0rt2ROudAIrfONav4UZP_iknNU/preview"
        ),
        action_id: "welcome-link"
      }
    ]
  }
];

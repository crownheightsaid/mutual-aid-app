const { str } = require("~strings/i18nextWrappers");

module.exports = [
  {
    type: "section",
    text: {
      type: "mrkdwn",
      text: str(
        "slackapp:home.volunteerSignUp.message",
        "Your Slack email isn't in our volunteer records.\nIf you want to get involved more please fill it out!"
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
          text: str(
            "slackapp:home.volunteerSignUp.formButton.text",
            "Volunteering Form"
          )
        },
        url: str(
          "slackapp:home.volunteerSignUp.formButton.url",
          "https://airtable.com/shraIzCNdiMwW1bpP"
        ),
        action_id: "volunteer-form"
      }
    ]
  },
  {
    type: "section",
    text: {
      type: "mrkdwn",
      text: str(
        "slackapp:home.volunteerSignUp.errorMessage",
        "If you already submitted one, it might take this page a few minutes to update 💦💾💾💦"
      )
    }
  }
];

const { str } = require("~strings/i18nextWrappers");

module.exports = [
  {
    type: "section",
    text: {
      type: "mrkdwn",
      text: str(
        "slackapp:home.trainedVolunteer.message",
        "You've been trained for intake! Here are some links for ya:"
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
            "slackapp:home.trainedVolunteer.shiftSignUpButton.text",
            "Intake Shift Sign Up"
          )
        },
        url: str(
          "slackapp:home.trainedVolunteer.shiftSignUpButton.url",
          "https://docs.google.com/spreadsheets/d/1T7FRsDVbV4Og8wyFN2Afopl9lZ4ojNuXMB5J6ELo_lw/edit"
        ),
        action_id: "volunteer-shifts"
      }
    ]
  },
  {
    type: "actions",
    elements: [
      {
        type: "button",
        text: {
          type: "plain_text",
          text: str(
            "slackapp:home.trainedVolunteer.intakeGuideButton.text",
            "Intake Guide"
          )
        },
        url: str(
          "slackapp:home.trainedVolunteer.intakeGuideButton.url",
          "https://docs.google.com/document/d/104HjEeFTLt17CGB8Oc31knC4--FDqWyKSidIfekSPr4/preview"
        ),
        action_id: "volunteer-guide"
      }
    ]
  }
];

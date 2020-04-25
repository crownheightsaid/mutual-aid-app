const { str } = require("~strings/i18nextWrappers");

module.exports = [
  {
    type: "section",
    text: {
      type: "mrkdwn",
      text: str(
        `slackapp:home.newVolunteer.message`,
        "Thanks for signing up to volunteer!\n If you want to call neighbors in need, please see if there are any upcoming intake training shifts:"
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
            `slackapp:home.newVolunteer.trainingButton.text`,
            "Upcoming Intake Training"
          )
        },
        url: str(
          `slackapp:home.newVolunteer.trainingButton.url`,
          "https://docs.google.com/spreadsheets/d/1T7FRsDVbV4Og8wyFN2Afopl9lZ4ojNuXMB5J6ELo_lw/edit#gid=2033187665"
        ),
        action_id: "volunteer-training"
      }
    ]
  }
];

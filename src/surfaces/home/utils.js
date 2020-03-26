exports.makeRequestSectionBlocks = (phone, callText) => {
  return [
    {
      type: "divider"
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `\n*Phone Number:* ${phone}`
      },
      accessory: {
        type: "button",
        text: {
          type: "plain_text",
          text: "Start Followup"
        },
        value: "followup"
      }
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*Voicemail message:* ${callText}\n`
      }
    }
  ];
};

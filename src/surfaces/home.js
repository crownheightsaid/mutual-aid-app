const makeRequestSectionBlocks = (phone, callText) => {
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

const listenVolunteerOpenHome = app => {
  app.event("app_home_opened", async ({ event, context }) => {
    try {
      if (!context.volunteerExists) {
        await app.client.views.publish({
          token: context.botToken,
          user_id: context.userId,
          view: {
            type: "home",
            blocks: [
              {
                type: "section",
                text: {
                  type: "mrkdwn",
                  text:
                    "Welcome!\n\n Please fill out the volunteer form to phone neighbors in need and request reimbursement."
                }
              },
              {
                type: "actions",
                elements: [
                  {
                    type: "button",
                    text: {
                      type: "plain_text",
                      text: "Volunteering Form"
                    },
                    url: process.env.VOLUNTEER_FORM_URL,
                    action_id: "volunteer-form"
                  }
                ]
              }
            ]
          }
        });
        return;
      }

      const requestSnapshot = [];
      const requestBlocks = [];
      requestSnapshot.forEach(doc => {
        const requestData = doc.data();
        makeRequestSectionBlocks(
          requestData.phone,
          requestData["call-text"]
        ).forEach(block => requestBlocks.push(block));
      });

      await app.client.views.publish({
        token: context.botToken,
        user_id: context.userId,
        view: {
          type: "home",
          blocks: [
            {
              type: "section",
              text: {
                type: "mrkdwn",
                text:
                  "Thanks for helping!\n\nAfter you submit the followup, a message will post in the community_needs channel. Once delivery volunteers offer their help, choose them by clicking the '...' on their message and selecting 'Assign to Delivery'\n"
              }
            },
            ...requestBlocks
          ]
        }
      });
    } catch (error) {
      console.error(error);
    }
  });
};

exports.listenVolunteerOpenHome = listenVolunteerOpenHome;

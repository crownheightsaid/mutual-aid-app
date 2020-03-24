const i18next = require("i18next");
const { addIntlNamespace } = require("../middleware.js");
const { normalizeFormInput } = require("./utils.js");
const { blockKitLanguages } = require("../i18n/languages.js");
const config = require("../../config.js");

const volunteerSignUpPath = "volunteer-sign-up";

const openVolunteerSignUp = app => {
  app.shortcut(
    volunteerSignUpPath,
    addIntlNamespace(volunteerSignUpPath),
    async ({ payload, ack, context }) => {
      ack();
      try {
        await app.client.views.open({
          token: context.botToken,
          trigger_id: payload.trigger_id,
          view: {
            type: "modal",
            callback_id: volunteerSignUpPath,
            title: {
              type: "plain_text",
              text: i18next.t("common:appName", config.APP_NAME)
            },
            submit: {
              type: "plain_text",
              text: i18next.t("common:submit", "Submit")
            },
            close: {
              type: "plain_text",
              text: i18next.t("common:cancel", "Cancel")
            },
            blocks: [
              {
                type: "section",
                text: {
                  type: "mrkdwn",
                  text:
                    "Thanks for the interest!\n\nFill out this form if you can reach out to people in need and match them with volunteers.\n\nIf you only plan on making deliveries, no need to fill this out. Instead, keep an eye out for requests for help <https://crownheightsmutualaid.slack.com/archives/C010D5AJSMA|in the #community_needs channel.>"
                }
              },
              {
                type: "divider"
              },
              {
                type: "input",
                element: {
                  type: "plain_text_input",
                  initial_value: context.userFullName,
                  action_id: "volunteer-name"
                },
                label: {
                  type: "plain_text",
                  text: "Full Name *"
                }
              },
              {
                type: "input",
                element: {
                  type: "plain_text_input",
                  initial_value: context.userEmail,
                  action_id: "volunteer-email"
                },
                label: {
                  type: "plain_text",
                  text: "Email *"
                }
              },
              {
                type: "input",
                element: {
                  type: "plain_text_input",
                  placeholder: {
                    type: "plain_text",
                    text: "#"
                  },
                  action_id: "volunteer-phone"
                },
                label: {
                  type: "plain_text",
                  text: "Phone Number *"
                }
              },
              {
                type: "input",
                element: {
                  type: "plain_text_input",
                  placeholder: {
                    type: "plain_text",
                    text: "55555"
                  },
                  action_id: "volunteer-postal"
                },
                label: {
                  type: "plain_text",
                  text: "Zip Code *"
                }
              },
              {
                type: "input",
                optional: true,
                element: {
                  type: "plain_text_input",
                  action_id: "volunteer-streets"
                },
                label: {
                  type: "plain_text",
                  text: i18next.t(
                    "volunteer-sign-up:crossStreets",
                    "Cross Streets"
                  )
                }
              },
              {
                type: "input",
                element: {
                  type: "static_select",
                  placeholder: {
                    type: "plain_text",
                    text: "Select a language"
                  },
                  action_id: "volunteer-primary-language",
                  options: blockKitLanguages,
                  initial_option: blockKitLanguages[0]
                },
                label: {
                  type: "plain_text",
                  text: "Primary Language"
                }
              },
              {
                type: "input",
                element: {
                  type: "multi_static_select",
                  placeholder: {
                    type: "plain_text",
                    text: "Select other languages"
                  },
                  action_id: "volunteer-languages",
                  options: blockKitLanguages,
                  initial_options: [blockKitLanguages[0]]
                },
                label: {
                  type: "plain_text",
                  text: "All languages you can speak"
                }
              },
              {
                type: "input",
                optional: true,
                element: {
                  type: "multi_static_select",
                  action_id: "volunteer-transportation",
                  options: [
                    {
                      text: {
                        type: "plain_text",
                        text: "Car"
                      },
                      value: "car"
                    },
                    {
                      text: {
                        type: "plain_text",
                        text: "Bike"
                      },
                      value: "bike"
                    },
                    {
                      text: {
                        type: "plain_text",
                        text: "None"
                      },
                      value: "none"
                    }
                  ],
                  initial_options: [
                    {
                      text: {
                        type: "plain_text",
                        text: "None"
                      },
                      value: "none"
                    }
                  ]
                },
                label: {
                  type: "plain_text",
                  text: "Transportation Access"
                }
              }
            ]
          }
        });
      } catch (error) {
        console.error(error);
      }
    }
  );
};

const listenVolunteerSignUpSubmission = app => {
  app.view(volunteerSignUpPath, async ({ ack, body, view, context }) => {
    ack();
    const formResult = {};
    Object.values(view.state.values).forEach(formValue => {
      const [field, value] = normalizeFormInput(formValue);
      formResult[field] = value;
    });
    console.log(formResult);
    // TODO add validation
    await context.db
      .collection("volunteers")
      .doc(context.userId)
      .set(formResult, { merge: true });
  });
};

const listenVolunteerSignUpAction = app => {
  app.action(
    { callback_id: volunteerSignUpPath },
    async ({ action, ack, context }) => {
      ack();
      console.log(`Action: ${JSON.stringify(action)}`);
    }
  );
};

exports.openVolunteerSignUp = openVolunteerSignUp;
exports.listenVolunteerSignUpAction = listenVolunteerSignUpAction;
exports.listenVolunteerSignUpSubmission = listenVolunteerSignUpSubmission;

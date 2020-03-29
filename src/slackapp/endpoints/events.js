const { createEventAdapter } = require("@slack/events-api");
const { openHomeWithSections } = require("../home.js");
const slackapi = require("../../slackapi.js");
const { findVolunteerByEmail } = require("../../airtable.js");

const slackEvents = createEventAdapter(process.env.SLACK_SIGNING_SECRET);

slackEvents.on("error", console.error);
slackEvents.on("app_home_opened", async event => {
  try {
    const homeSections = ["base"];
    const user = await slackapi.users.info({
      token: process.env.SLACK_BOT_TOKEN,
      user: event.user,
      include_locale: true
    });
    const volunteer = await findVolunteerByEmail(user.user.profile.email);
    if (!volunteer) {
      homeSections.push("volunteerSignUp");
    }

    openHomeWithSections(event.user, homeSections);
  } catch (error) {
    console.error(error);
  }
});

module.exports = slackEvents.requestListener();

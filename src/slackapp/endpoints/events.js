const { createEventAdapter } = require("@slack/events-api");
const { openHomeWithSections } = require("../home.js");
const slackapi = require("~slack/webApi");
const { findVolunteerByEmail } = require("~airtable/tables/volunteers");

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
    const [volunteer, err] = await findVolunteerByEmail(
      user.user.profile.email
    );
    if (err) {
      throw new Error(err);
    }
    homeSections.push("divider");
    if (!volunteer) {
      homeSections.push("volunteerSignUp");
    } else if (volunteer.get("volunteer_trained")) {
      homeSections.push("trainedVolunteerInfo");
    } else {
      homeSections.push("newVolunteerInfo");
    }

    openHomeWithSections(event.user, homeSections);
  } catch (error) {
    console.error(`Error opening home page: ${error}`);
    openHomeWithSections(event.user, ["base"]);
  }
});

module.exports = slackEvents.requestListener();

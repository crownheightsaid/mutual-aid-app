const slackapi = require("~slack/webApi");
const { findVolunteerByEmail } = require("~airtable/tables/volunteers");
const { openHomeWithSections } = require("~slack/home");

module.exports.register = function register(slackEvents) {
  slackEvents.on("app_home_opened", openHome);
};

const openHome = async (event) => {
  try {
    const homeSections = ["base"];
    const user = await slackapi.users.info({
      token: process.env.SLACK_BOT_TOKEN,
      user: event.user,
      include_locale: true,
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
};

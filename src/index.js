const { App } = require("@slack/bolt");
const { initIntl, addUserInfo } = require("./middleware.js");
const {
  openVolunteerSignUp,
  listenVolunteerSignUpSubmission
} = require("./surfaces/volunteer-sign-up.js");
const { listenVolunteerOpenHome } = require("./surfaces/home.js");

const app = new App({
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  token: process.env.SLACK_BOT_TOKEN
});

app.use(addUserInfo(app));
app.use(initIntl);
app.error(console.error);

openVolunteerSignUp(app);
listenVolunteerSignUpSubmission(app);

listenVolunteerOpenHome(app);

module.exports = app;

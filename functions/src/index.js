const functions = require("firebase-functions");
const { App, ExpressReceiver } = require("@slack/bolt");
const admin = require("firebase-admin");
const { initIntl, withFirestore, addUserInfo } = require("./middleware.js");
const {
  openVolunteerSignUp,
  listenVolunteerSignUpSubmission
} = require("./surfaces/volunteer-sign-up.js");
const { listenVolunteerOpenHome } = require("./surfaces/home.js");
const config = require("../config.js");

const expressReceiver = new ExpressReceiver({
  signingSecret: config.SLACK_SIGNING_SECRET,
  endpoints: "/"
});
const app = new App({
  receiver: expressReceiver,
  token: config.SLACK_BOT_TOKEN
});
admin.initializeApp();

app.use(withFirestore);
app.use(addUserInfo(app));
app.use(initIntl);
app.error(console.error);

openVolunteerSignUp(app);
listenVolunteerSignUpSubmission(app);

listenVolunteerOpenHome(app);

module.exports = functions
  .region("us-east1")
  .https.onRequest(expressReceiver.app);

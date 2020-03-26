const { App } = require("@slack/bolt");
const startEvents = require("./src/endpoints/events.js");
const startInteractivity = require("./src/endpoints/interactivity.js");
const { initIntl, addUserInfo } = require("./src/middleware.js");

const app = new App({
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  token: process.env.SLACK_BOT_TOKEN
});

app.use(addUserInfo(app));
app.use(initIntl);
app.error(console.error);

startEvents(app);
startInteractivity(app);

app.all("/slacktest", (req, res, next) => {
  console.log("Accessing the secret section ...\n");
  console.log(req);
  console.log("Response: \n");
  console.log(res);
  next(); // pass control to the next handler
});

(async () => {
  // Start the app
  await app.start(process.env.PORT || 3000);

  console.log("Slack app running!");
  console.log(`Listening on ${process.env.PORT}`);
})();

const { App, ExpressReceiver } = require("@slack/bolt");
const startEvents = require("./src/endpoints/events.js");
const startInteractivity = require("./src/endpoints/interactivity.js");
const { initIntl, addUserInfo } = require("./src/middleware.js");

const expressReceiver = new ExpressReceiver({
  signingSecret: process.env.SLACK_SIGNING_SECRET
});
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  receiver: expressReceiver
});
const express = expressReceiver.app;

app.use(addUserInfo(app));
app.use(initIntl);
app.error(console.error);

startEvents(app);
startInteractivity(app);

express.all("/slacktest", (req, res) => {
  console.log("Accessing the secret section ...\n");
  console.log(req);
  console.log("Response: \n");
  console.log(res);
  res.status(200).send(); // respond 200 OK to the default health check method
});

(async () => {
  // Start the app
  await app.start(process.env.PORT || 3000);

  console.log("Slack app running!");
  console.log(`Listening on ${process.env.PORT}`);
})();

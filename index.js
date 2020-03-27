const { App, ExpressReceiver } = require("@slack/bolt");
const startEvents = require("./src/endpoints/events.js");
const startInteractivity = require("./src/endpoints/interactivity.js");
const { startGmailSync } = require("./src/gmail-sync-worker.js");
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

if(process.env.SYNC_GMAIL){
  startGmailSync(app);
}

express.get("/expressroute", (req, res) => {
  res.status(200).send();
});

(async () => {
  // Start the app
  await app.start(process.env.PORT || 3000);

  console.log("Slack app running!");
  console.log(`Listening on ${process.env.PORT}`);
})();

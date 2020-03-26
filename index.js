const path = require("path");
const { App, ExpressReceiver } = require("@slack/bolt");
const startEvents = require("./src/endpoints/events.js");
const startInteractivity = require("./src/endpoints/interactivity.js");
const { initIntl, addUserInfo } = require("./src/middleware.js");

const expressReceiver = new ExpressReceiver({
  signingSecret: process.env.SLACK_SIGNING_SECRET
});
const boltApp = new App({
  token: process.env.SLACK_BOT_TOKEN,
  receiver: expressReceiver
});
const express = expressReceiver.app;

boltApp.use(addUserInfo(boltApp));
boltApp.use(initIntl);
boltApp.error(console.error);

startEvents(boltApp);
startInteractivity(boltApp);

express.get("/webapp", (req, res) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});

(async () => {
  // Start the app
  await boltApp.start(process.env.PORT || 3000);

  console.log("Slack app running!");
  console.log(`Listening on ${process.env.PORT}`);
})();

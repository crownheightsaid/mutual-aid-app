const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
const { App, ExpressReceiver } = require("@slack/bolt");
const startEvents = require("./src/endpoints/events.js");
const startInteractivity = require("./src/endpoints/interactivity.js");
const { initIntl, addUserInfo } = require("./src/middleware.js");
const { addressHandler } = require("./src/endpoints/geo.js");

const expressReceiver = new ExpressReceiver({
  signingSecret: process.env.SLACK_SIGNING_SECRET
});
const boltApp = new App({
  token: process.env.SLACK_BOT_TOKEN,
  receiver: expressReceiver
});
const expressApp = expressReceiver.app;

// ---------- SLACK ONLY -------------

boltApp.use(addUserInfo(boltApp));
boltApp.use(initIntl);
boltApp.error(console.error);

startEvents(boltApp);
startInteractivity(boltApp);

// ---------- CUSTOM ENDPOINTS -------------

expressApp.use(bodyParser.json());
expressApp.use(bodyParser.urlencoded({ extended: true }));

expressApp.post("/geo/address-metadata", addressHandler);

expressApp.use(express.static(path.join(__dirname, "build")));
expressApp.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});
expressApp.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});

(async () => {
  // Start the app
  await boltApp.start(process.env.PORT || 3000);

  console.log("Crown Heights app running!");
  console.log(`Listening on ${process.env.PORT}`);
})();

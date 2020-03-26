const path = require("path");
const express = require("express");
const SlackStrategy = require("passport-slack").Strategy;
const passport = require("passport");
const bodyParser = require("body-parser");
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
const expressApp = expressReceiver.app;

boltApp.use(addUserInfo(boltApp));
boltApp.use(initIntl);
boltApp.error(console.error);

startEvents(boltApp);
startInteractivity(boltApp);

expressApp.use(bodyParser.json());
expressApp.use(bodyParser.urlencoded({ extended: true }));

passport.use(
  new SlackStrategy(
    {
      clientID: process.env.SLACK_CLIENT_ID,
      clientSecret: process.env.SLACK_CLIENT_SECRET
    },
    (accessToken, refreshToken, profile, done) => {
      done(null, accessToken);
    }
  )
);

expressApp.use(passport.initialize());
expressApp.use(require("body-parser").urlencoded({ extended: true }));
// path to start the OAuth flow
expressApp.get("/auth/slack", passport.authorize("slack"));
// OAuth callback url
expressApp.get(
  "/auth/slack/callback",
  passport.authorize("slack", { failureRedirect: "/login" }),
  (req, res) => {
    console.log("Callback\n");
    console.log(req.body);
    console.log(res);
    res.redirect("/");
  }
);

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

  console.log("Slack app running!");
  console.log(`Listening on ${process.env.PORT}`);
})();

const { App } = require("@slack/bolt");
const path = require("path");
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

app.get("/webapp", (req, res) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});

(async () => {
  // Start the app
  await app.start(process.env.PORT || 3000);

  console.log("Slack app running!");
  console.log(`Listening on ${process.env.PORT}`);
})();

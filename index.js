const app = require("./src/index.js");

(async () => {
  // Start the app
  await app.start(process.env.PORT || 3000);

  console.log("Slack app running!");
  console.log(`Listening on ${process.env.PORT}`);
})();

require("module-alias/register");
require("dotenv").config();

const path = require("path");
const express = require("express");
const basicAuth = require("express-basic-auth");
const bodyParser = require("body-parser");
const airtableWorker = require("./src/workers/airtable-sync/worker");
const airtablePaymentsWorker = require("./src/workers/airtable-sync/paymentWorker");
const { addressHandler } = require("./src/api/geo.js");
const { nycmaIntakeHandler } = require("./src/api/authed/intake/manyc.js");
const { nycmaOuttakeHandler } = require("./src/api/authed/outtake/manyc.js");
const {
  neighborhoodFinderUpdateRequestHandler
} = require("./src/api/neighborhood-finder/update-request.js");

/* eslint-disable global-require  */
const app = express();

if (!process.env.AIRTABLE_BASE || !process.env.AIRTABLE_KEY) {
  console.warn("An airtable key is missing. Something will probably break :/");
}

// ==================================================================
// Slack (must come before body parser)
// ==================================================================

if (process.env.SLACK_BOT_TOKEN && process.env.SLACK_SIGNING_SECRET) {
  app.post("/slack/events", require("./src/slackapp/endpoints/events.js"));
  app.post(
    "/slack/interactivity",
    require("./src/slackapp/endpoints/interactivity.js")
  );
} else {
  console.warn("Slack tokens are missing! Slack routes won't exist.");
}

// ==================================================================
// Common Middleware
// ==================================================================

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// ==================================================================
// API Routes
// ==================================================================

if (process.env.GOOGLE_MAPS_API_KEY && process.env.GEONAME_CLIENT_ID) {
  app.post("/api/geo/address-metadata", addressHandler);
} else {
  console.warn("Geo keys missing. Not starting geo routes.");
}

app.post(
  "/api/neighborhood-finder/update-request",
  neighborhoodFinderUpdateRequestHandler
);

// ==================================================================
// API Routes (w/ Basic Auth)
// ==================================================================

if (process.env.BASIC_AUTH_USERS) {
  const allUsers = {};
  const userPass = process.env.BASIC_AUTH_USERS.split(";");
  userPass.forEach(pair => {
    const [user, pass] = pair.split(":");
    allUsers[user] = pass;
  });

  app.use(
    "/api/authed/*",
    basicAuth({
      users: allUsers
    })
  );
  app.post("/api/authed/intake/nycma", nycmaIntakeHandler);
  app.post("/api/authed/outtake/nycma", nycmaOuttakeHandler);
} else if (process.env.NODE_ENV !== "production") {
  console.warn("Not production environment and no authed users set.");
  console.warn("Authed API routes are accessible without authentication.");

  app.post("/api/authed/intake/nycma", nycmaIntakeHandler);
  app.post("/api/authed/outtake/nycma", nycmaOuttakeHandler);
} else {
  console.warn(
    "No basic auth users registered. Not starting authed API routes."
  );
}

// ==================================================================
// React App + Static Serving
// ==================================================================

app.use(express.static(path.join(__dirname, "build")));
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});

// ==================================================================
// In-process Workers
// ==================================================================

const airtableIntervalMs = parseInt(process.env.AIRTABLE_SYNC || 0);
if (airtableIntervalMs > 0) {
  airtableWorker(airtableIntervalMs);
  if (process.env.AIRTABLE_PAYMENTS_BASE) {
    airtablePaymentsWorker(airtableIntervalMs);
  }
}

// ==================================================================
// Start Express Server
// ==================================================================

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Mutual Aid app listening on ${port}!`);
});

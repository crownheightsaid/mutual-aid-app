require("dotenv").config();

const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
const eventsHandler = require("./src/slackapp/endpoints/events.js");
const interactivityHandler = require("./src/slackapp/endpoints/interactivity.js");
const airtableWorker = require("./src/workers/airtable-sync/worker");
const { addressHandler } = require("./src/api/geo.js");

const app = express();

if (!process.env.AIRTABLE_BASE || !process.env.AIRTABLE_KEY) {
  console.warn("An airtable key is missing. Something will probably break :/");
}

// ---------- SLACK ONLY -------------

if (process.env.SLACK_BOT_TOKEN && process.env.SLACK_SIGNING_SECRET) {
  app.post("/slack/events", eventsHandler);
  app.post("/slack/interactivity", interactivityHandler);
} else {
  console.warn("Slack tokens are missing! Slack routes won't exist.");
}

// ---------- COMMON MIDDLEWARE -------------

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// ---------- API ROUTES -------------

if (process.env.GOOGLE_MAPS_API_KEY && process.env.GEONAME_CLIENT_ID) {
  app.post("/api/geo/address-metadata", addressHandler);
} else {
  console.warn("Geo keys missing. Not starting geo routes.");
}

// ---------- REACT APP + STATIC SERVING -------------

app.use(express.static(path.join(__dirname, "build")));
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});

// ---------- IN-PROCESS WORKERS -------------

const airtableInterval = parseInt(process.env.AIRTABLE_SYNC || 0, 10);
if (airtableInterval > 0) {
  airtableWorker(airtableInterval);
}

// ---------- START MAIN APP -------------

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Mutual Aid app listening on ${port}!`);
});

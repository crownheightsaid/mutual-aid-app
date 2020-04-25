// Helper for composing home tab sections.
// See https://api.slack.com/surfaces/tabs/using

const assert = require("assert");
const slackApi = require("~slack/webApi");

const baseBlocks = require("./homeblocks/base.js");
const volunteerSignUpBlocks = require("./homeblocks/volunteerSignUp.js");
const trainedVolunteerInfo = require("./homeblocks/trainedVolunteerInfo.js");
const newVolunteerInfo = require("./homeblocks/newVolunteerInfo.js");
const divider = require("./homeblocks/divider.js");

const homeBlocks = {
  base: {
    blocks: baseBlocks
  },
  volunteerSignUp: {
    blocks: volunteerSignUpBlocks
  },
  newVolunteerInfo: {
    blocks: newVolunteerInfo
  },
  trainedVolunteerInfo: {
    blocks: trainedVolunteerInfo
  },
  divider: {
    blocks: divider
  }
};

exports.openHomeWithSections = async (userId, sectionNames) => {
  const loadedBlocks = [];
  sectionNames.forEach(sectionName => {
    assert(homeBlocks[sectionName], "Home page section not registered.");
    loadedBlocks.push(...homeBlocks[sectionName].blocks);
  });
  await slackApi.views.publish({
    token: process.env.SLACK_BOT_TOKEN,
    user_id: userId,
    view: {
      type: "home",
      blocks: loadedBlocks
    }
  });
};

const assert = require("assert");
const slackApi = require("../slackapi.js");

const baseBlocks = require("../../translations/en/homeblocks/base.json");
const volunteerSignUpBlocks = require("../../translations/en/homeblocks/volunteerSignUp.json");
const trainedVolunteerInfo = require("../../translations/en/homeblocks/trainedVolunteerInfo.json");
const newVolunteerInfo = require("../../translations/en/homeblocks/newVolunteerInfo.json");
const divider = require("../../translations/en/homeblocks/divider.json");

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

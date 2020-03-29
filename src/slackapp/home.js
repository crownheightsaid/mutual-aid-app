const assert = require("assert");
const slackApi = require("../slackapi.js");

const baseBlocks = require("../../translations/en/homeblocks/base.json");
const volunteerSignUpBlocks = require("../../translations/en/homeblocks/volunteerSignUp.json");

const homeBlocks = {
  base: {
    blocks: baseBlocks
  },
  volunteerSignUp: {
    blocks: volunteerSignUpBlocks
  }
};

exports.openHomeWithBlocks = async (userId, sectionNames) => {
  const loadedBlocks = [];
  sectionNames.forEach(sectionName => {
    assert(homeBlocks[sectionName], "Home page section not registered.");
    loadedBlocks.push(...homeBlocks[sectionName].block);
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

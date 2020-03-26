const assert = require("assert");

// These correspond to `translations/{lang}/homepages/{path}`
const homePages = {
  signUp: {
    path: "volunteer-sign-up"
  },
  volunteerHome: {
    path: "volunteer"
  }
};

exports.openHome = async (userId, homePage, app) => {
  assert(homePages[homePage], "App home page not registered");
  const page = require(`../../translations/en/homepages/${homePages[homePage].path}.json`);
  await app.client.views.publish({
    token: process.env.SLACK_BOT_TOKEN,
    user_id: userId,
    view: page
  });
};

const { openHome } = require("../surfaces/home/home.js");

const listenVolunteerOpenHome = app => {
  app.event("app_home_opened", async ({ event, context }) => {
    try {
      if (!context.volunteerExists) {
        openHome(context.userId, "signUp", app);
        return;
      }

      openHome(context.userId, "volunteerHome", app);
    } catch (error) {
      console.error(error);
    }
  });
};

module.exports = app => {
  listenVolunteerOpenHome(app);
};

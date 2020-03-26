const path = require("path");
const i18next = require("i18next");
const Backend = require("i18next-node-fs-backend");
const { findVolunteerById } = require("./airtable");

function addUserInfo(app) {
  return async ({ payload, body, event, context, next }) => {
    let userId = "";
    if (event) {
      userId = event.user;
    } else if (body) {
      userId = body.user.id;
    } else {
      userId = payload.user.id;
    }
    console.log(`Add userInfo start: ${userId}`);
    console.log(event);
    const user = await app.client.users.info({
      token: context.botToken,
      user: userId,
      include_locale: true
    });
    await findVolunteerById(user.user.profile.email);
    context.userId = userId;
    context.locale = user.user.locale;
    context.userEmail = user.user.profile.email;
    context.userFullName = user.user.real_name;
    console.log(`Add addUserInfo end`);
    next();
  };
}

async function initIntl({ payload, context, next }) {
  console.log("Init intl start");
  i18next.use(Backend).init(
    {
      backend: {
        loadPath: path.resolve(
          __dirname,
          "../translations/{{lng}}/{{ns}}.json"
        ),
        addPath: path.resolve(
          __dirname,
          "../translations/{{lng}}/{{ns}}.missing.json"
        )
      },
      lng: context.locale ? context.locale : "en",
      load: "languageOnly", // Strips country (en-US -> en)
      ns: ["common"], // Namespaces to load
      fallbackLng: "en"
    },
    err => {
      if (err) {
        console.log("Couldn't load languages: ", err);
      }
      console.log("Init intl end");
      return next();
    }
  );
}

function addIntlNamespace(intlNamespace) {
  return ({ next }) => {
    console.log("Load intl namespace start");
    i18next.loadNamespaces(intlNamespace, err => {
      if (err) {
        console.log("Couldn't load path namespace: ", err);
      }
      console.log("Load intl namespace end");
      next();
    });
  };
}

exports.addIntlNamespace = addIntlNamespace;
exports.initIntl = initIntl;
exports.addUserInfo = addUserInfo;

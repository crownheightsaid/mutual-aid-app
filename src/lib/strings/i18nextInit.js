const i18next = require("i18next");
const { join } = require("path");
const FilesystemResourceBackend = require("i18next-fs-backend");
const HttpResourceBackend = require("i18next-http-backend");
const {
  SUPPORTED_LANGS,
  NAMESPACES_MAPPINGS: ns
} = require("./i18nextConstants");

/* eslint-disable global-require  */
const commonI18nOptions = {
  lng: "en",
  fallbackLng: "en",
  whitelist: SUPPORTED_LANGS,
  nonExplicitWhitelist: true, // 'en-US' becomes 'en'
  defaultNS: "common",
  cleanCode: true, // auto-lowercase lang codes
  load: "languageOnly", // e.g. only load 'en' for 'en-US'
  initImmediate: false, // Blocking init
  debug: !!process.env.DEBUG,
  returnEmptyString: false,
  returnNull: false
};
if (process.env.REACT_APP_CONTEXT) {
  // TODO, react-language-detector
  i18next.default
    .use(HttpResourceBackend.default)
    .use(require("react-i18next").initReactI18next)
    .init({
      ...commonI18nOptions,
      ns: [ns.webapp, ns.common],
      preload: ["en"],
      backend: {
        loadPath: "/locales/{{lng}}/{{ns}}.json"
      }
    });
} else {
  i18next.use(FilesystemResourceBackend).init({
    ...commonI18nOptions,
    ns: [ns.common, ns.airtable, ns.twilio, ns.slackapp],
    preload: SUPPORTED_LANGS,
    backend: {
      loadPath: join(__dirname, "./locales/{{lng}}/{{ns}}.json")
    }
  });
}

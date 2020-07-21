const { SUPPORTED_LANGS, NAMESPACES_MAPPINGS } = require("./i18nextConstants");

module.exports = {
  output: "./",
  options: {
    debug: true,
    func: {
      list: ["t", "str"],
      extensions: [".js", ".jsx"]
    },
    trans: false, // don't support react Trans component
    lngs: SUPPORTED_LANGS,
    ns: Object.values(NAMESPACES_MAPPINGS),
    defaultLng: "en",
    defaultNs: NAMESPACES_MAPPINGS.common,
    defaultValue: "__NOT_TRANSLATED__",
    resource: {
      loadPath: "src/lib/strings/locales/{{lng}}/{{ns}}.json",
      savePath: "src/lib/strings/locales/{{lng}}/{{ns}}.json",
      jsonIndent: 2,
      lineEnding: "\n"
    },
    interpolation: {
      prefix: "{{",
      suffix: "}}"
    }
  }
};

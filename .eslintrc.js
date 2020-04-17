module.exports = {
  root: true,
  parser: "babel-eslint",
  extends: [
    "airbnb",
    "react-app",
    "plugin:no-unsanitized/DOM",
    "plugin:prettier/recommended",
    "plugin:react/recommended",
    "plugin:jsx-a11y/recommended"
  ],
  plugins: ["react", "prettier", "no-unsanitized", "react-hooks", "jsx-a11y", "promise"],
  parserOptions: {
    ecmaFeatures: {
      jsx: true
    },
    sourceType: "module"
  },
  rules: {
    "no-unused-vars": ["error", { "varsIgnorePattern": "_.+" }],
    "no-console": ["off"],
    "react/prop-types": ["off"],
    "react/static-property-placement": ["error", "static public field"],
    "react/forbid-prop-types": ["off"],
    "react/jsx-filename-extension": ["off"],
    "react/destructuring-assignment": ["off"],
    "react-hooks/rules-of-hooks": ["error"],
    "radix": ["off"] //fixed in ES5
  },
  settings: {
    "import/resolver": {
      alias: {
        map: [
          ["~airtable", "./src/lib/airtable"],
          ["~slack", "./src/lib/slack"],
          ["~assets", "./src/lib/assets"],
          ["~constants", "./src/lib/constants.js"]
        ],
        extensions: ['.ts', '.js', '.jsx', '.json']
      },
      node: {
        moduleDirectory: ["node_modules", "src"]
      }
    }
  },
  globals: {
    __PATH_PREFIX__: true
  }
};

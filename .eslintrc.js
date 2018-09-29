module.exports = {
  env: {
    es6: true,
    browser: true
  },
  extends: ["eslint:recommended", "prettier"],
  parserOptions: {
    ecmaVersion: 2017,
    sourceType: "module"
  },
  rules: {
    "no-console": "off"
  },
  globals: {
    m: true,
    L: true
  }
};

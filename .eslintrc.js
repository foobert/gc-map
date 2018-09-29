module.exports = {
  env: {
    es6: true,
    browser: true
  },
  extends: ["eslint:recommended", "prettier"],
  parserOptions: {
    ecmaVersion: 2017
  },
  rules: {
    "no-console": "off"
  },
  globals: {
    m: true,
    L: true
  }
};

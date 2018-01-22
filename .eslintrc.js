module.exports = {
  extends:  [
    "eslint:recommended",
    "plugin:react/recommended",
  ],
  env: {
    browser: true,
    node: true,
    jest: true,
  },
  parserOptions: {
    ecmaVersion: 6,
    sourceType: "module",
    ecmaFeatures: {
      jsx: true,
    },
  },
  rules: {
    "indent": ["error", 2],
    "comma-dangle": ["error", "always-multiline"],
    "quote-props": ["error", "consistent-as-needed"],
    "quotes": ["error", "double"],
  },
};

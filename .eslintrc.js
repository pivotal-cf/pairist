module.exports = {
  extends: ["eslint:recommended", "plugin:vue/recommended"],
  env: {
    browser: true,
    node: true,
    jest: true,
  },
  parserOptions: {
    parser: "babel-eslint",
    ecmaVersion: 6,
    sourceType: "module",
  },
  rules: {
    "indent": ["error", 2],
    "comma-dangle": ["error", "always-multiline"],
    "quote-props": ["error", "consistent-as-needed"],
    "quotes": ["error", "double"],
    "semi": ["error", "never"],
    "vue/max-attributes-per-line": [5, "multiline"],
    "no-debugger": "off",
  },
}

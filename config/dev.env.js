"use strict"
const merge = require("webpack-merge")
const prodEnv = require("./prod.env")

module.exports = merge(prodEnv, {
  NODE_ENV: JSON.stringify("development"),
  FIREBASE_API_KEY: JSON.stringify("development"),
  FIREBASE_AUTH_DOMAIN: JSON.stringify("development"),
  FIREBASE_URL: JSON.stringify("ws://localhost.firebaseio.test:5000"),
})

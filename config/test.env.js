"use strict"
const merge = require("webpack-merge")
const devEnv = require("./dev.env")

module.exports = merge(devEnv, {
  NODE_ENV: JSON.stringify("testing"),
  FIREBASE_API_KEY: JSON.stringify("AIzaSyC4IhaLy_VyCruDfhRJ7NQn_47nxnTnotA"),
  FIREBASE_AUTH_DOMAIN: JSON.stringify("pairist-test.firebaseapp.com"),
  FIREBASE_URL: JSON.stringify("https://pairist-test.firebaseio.com"),
  FIREBASE_PROJECT_ID: JSON.stringify("pairist-test"),
  FIREBASE_STORAGE_BUCKET: JSON.stringify("pairist-test.appspot.com"),
  FIREBASE_MESSAGING_SENDER_ID: JSON.stringify("974627757295"),
})

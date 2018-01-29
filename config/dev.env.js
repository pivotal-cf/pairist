"use strict"
const merge = require("webpack-merge")
const prodEnv = require("./prod.env")

module.exports = merge(prodEnv, {
  NODE_ENV: JSON.stringify("development"),
  FIREBASE_API_KEY: JSON.stringify("AIzaSyCDWphgIvjLGMhGcA9hERpfiYWAK9b3_18"),
  FIREBASE_AUTH_DOMAIN: JSON.stringify("pairist-dev.firebaseapp.com"),
  FIREBASE_URL: JSON.stringify("https://pairist-dev.firebaseio.com"),
  FIREBASE_PROJECT_ID: JSON.stringify("pairist-dev"),
  FIREBASE_STORAGE_BUCKET: JSON.stringify("pairist-dev.appspot.com"),
  FIREBASE_MESSAGING_SENDER_ID: JSON.stringify("974627485998"),
})

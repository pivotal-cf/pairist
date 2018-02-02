"use strict"
/* eslint-disable no-console */

var Promise = require("es6-promise").Promise
var admin = require("firebase-admin")
var serviceAccount = require(`${process.env.HOME}/.secrets/pairist-test-service-account.json`)

module.exports = {
  before(_, done) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: "https://pairist-test.firebaseio.com",
    })

    var deleteUsers = new Promise((resolve, reject) => {
      admin.auth().listUsers()
        .then((listUsersResult) => {
          var promises = listUsersResult.users.map((userRecord) =>
            admin.auth().deleteUser(userRecord.uid)
          )
          Promise.all(promises).then(resolve).catch(reject)
        })
        .catch(reject)
    })
    var clearDB = new Promise((resolve, reject) => {
      admin.database().ref().remove().then(resolve).catch(reject)
    })

    Promise.all([deleteUsers, clearDB]).then(() => done()).catch(done)
  },

  after(client) {
    admin.app().delete()
    client.end()
  },

  "DAY 0: create account"(client) {
    const devServer = client.globals.devServerURL

    client.url(devServer)
    client.expect.element("body").to.be.present.before(1000)

    var home = client.page.home()
    home.setValue("@teamNameInput", "my-team")
    home.setValue("@passwordInput", "password")
    home.click("@createButton")
    home.waitForElementNotPresent("@createButton", 2000)
  },

  "DAY 0: create team members and tracks"(client) {
    var team = client.page.team()
    team.waitForElementVisible("@title", 1000)

    team.expect.element("@title").text.to.contain("MY-TEAM")

    team.track("track-1").add()
    team.track("track-2").add()
    team.track("track-3").add()

    team.track("track-1").toBeUnassigned()
    team.track("track-2").toBeUnassigned()
    team.track("track-3").toBeUnassigned()

    team.role("role-1").add()
    team.role("role-2").add()
    team.role("role-3").add()

    team.role("role-1").toBeUnassigned()
    team.role("role-2").toBeUnassigned()
    team.role("role-3").toBeUnassigned()

    for (var i = 1; i <= 6; i++) {
      team.person(`person-${i}`).add()
    }

    for (i = 1; i <= 6; i++) {
      team.person(`person-${i}`).toBeUnassigned()
    }
  },

  "DAY 1: allocate people"(client) {
    var team = client.page.team()

    team.person("person-1").moveToLane("last()")
    team.person("person-2").moveToLane("1")
    team.person("person-3").moveToLane("last()")
    team.person("person-4").moveToLane("2")
    team.person("person-2").moveToLane("2")
    team.person("person-4").moveToLane("1")

    team.person("person-6").moveToOut()

    team.person("person-1").toBeInLane("1")
    team.person("person-4").toBeInLane("1")

    team.person("person-2").toBeInLane("2")
    team.person("person-3").toBeInLane("2")

    team.person("person-5").toBeUnassigned
    team.person("person-6").toBeOut()

    team.track("track-1").moveToLane("1")
    team.track("track-2").moveToLane("2")

    team.track("track-1").toBeInLane("1")
    team.track("track-2").toBeInLane("2")

    team.role("role-3").moveToLane("1")
    team.role("role-2").moveToLane("2")

    team.role("role-3").toBeInLane("1")
    team.role("role-2").toBeInLane("2")

    team.saveHistory()
  },

  "DAY 2: allocate people"(client) {
    var team = client.page.team()

    team.person("person-3").moveToLane("3")
    team.person("person-4").moveToLane("2")
    team.person("person-5").moveToLane("1")

    team.person("person-1").toBeInLane("1")
    team.person("person-5").toBeInLane("1")

    team.person("person-2").toBeInLane("2")
    team.person("person-4").toBeInLane("2")

    team.person("person-3").toBeInLane("3")

    team.saveHistory()
  },

  "DAY 3: delete some elements and recommend"(client) {
    var team = client.page.team()

    team.role("role-3").delete()
    team.track("track-3").delete()
    team.person("person-5").delete()

    team.role("role-3").notToExist()
    team.track("track-3").notToExist()
    team.person("person-5").notToExist()

    team.person("person-1").edit("renamed-1")
    team.person("person-1").notToExist()

    team.person("renamed-1").toBeInLane("1")

    team.person("person-2").toBeInLane("2")
    team.person("person-4").toBeInLane("2")

    team.person("person-3").toBeInLane("3")

    team.recommendPairs()

    team.expectMessage("Cannot make a valid pairing assignment. Do you have too many lanes?", "error")

    team.person("person-3").moveToUnassigned()

    team.recommendPairs()

    team.person("renamed-1").toBeInLane("1")
    team.person("person-2").toBeInLane("1")

    team.person("person-4").toBeInLane("2")
    team.person("person-3").toBeInLane("2")

    team.recommendPairs()
    team.expectMessage("Pairing setting is already the optimal one. No actoins taken", "accent")

    team.saveHistory()
  },

  "DAY 3: navigating back, logout, login"(client) {
    const devServer = client.globals.devServerURL
    client.url(devServer)
    client.pause(1000)

    var team = client.page.team()
    team.waitForElementVisible("@title", 1000)
    team.expect.element("@title").text.to.contain("MY-TEAM")

    client.assert.urlContains("my-team")

    team.logout()
    team.waitForElementNotPresent("@moreMenuButton", 1000)

    var home = client.page.home()
    home.setValue("@teamNameInput", "my-team")
    home.setValue("@passwordInput", "password")
    home.click("@loginButton")
    home.waitForElementNotPresent("@loginButton", 2000)

    team.waitForElementVisible("@title", 1000)
    team.expect.element("@title").text.to.contain("MY-TEAM")

    client.assert.urlContains("my-team")
  },

  "DAY 4: locks and recommend"(client) {
    var team = client.page.team()

    team.lockLane("1")
    team.person("person-2").moveToUnassigned()

    team.recommendPairs()

    team.person("renamed-1").toBeInLane("1")

    team.person("person-3").toBeInLane("2")
    team.person("person-2").toBeInLane("2")

    team.person("person-4").toBeInLane("3")
  },
}

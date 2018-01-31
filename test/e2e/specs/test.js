"use strict"
/* eslint-disable no-console */

var Promise = require("es6-promise").Promise
var admin = require("firebase-admin")
var serviceAccount = require(`${process.env.HOME}/.secrets/pairist-test-service-account.json`)

module.exports = {
  before() {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: "https://pairist-test.firebaseio.com",
    })
  },

  after() {
    admin.app().delete()
  },

  beforeEach(_, done) {
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
  //
  journey(client) {
    const devServer = client.globals.devServerURL

    client.url(devServer)
    client.expect.element("body").to.be.present.before(1000)

    var home = client.page.home()
    home.setValue("@teamNameInput", "my-team")
    home.setValue("@passwordInput", "password")
    home.click("@createButton")
    client.pause(2000)

    var team = client.page.team()
    team.waitForElementVisible("@title", 1000)

    team.expect
      .element("@title")
      .text.to.contain("MY-TEAM")
      .before(1000)

    team.addTrack("track-1")
    team.addTrack("track-2")
    team.addTrack("track-3")

    team.addRole("role-1")
    team.addRole("role-2")
    team.addRole("role-3")

    for (var i = 1; i <= 6; i++) {
      team.addPerson(`person-${i}`)
    }

    for (i = 1; i <= 6; i++) {
      client
        .useXpath()
        .expect
        .element(team.el("@personCard", `person-${i}`))
        .to.be.visible
        .before(1000)
    }

    client.end()
  },
}

const admin = require('firebase-admin')
const serviceAccount = require(`${process.env.HOME}/.secrets/pairist-test-service-account.json`)
const util = require('util')
const exec = util.promisify(require('child_process').exec)
const devServer = process.env.VUE_DEV_SERVER_URL
const _ = require('lodash/fp')

module.exports = {
  async before (_client, done) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: 'https://pairist-test.firebaseio.com',
    })

    try {
      const users = await admin.auth().listUsers()
      await _.map(async (userRecord) =>
        admin.auth().deleteUser(userRecord.uid)
      )(users.users)
      await admin.database().ref().remove()

      await exec('TARGET_ENV=e2e yarn migrate')

      done()
    } catch (error) {
      done(error)
    }
  },

  after (client) {
    admin.app().delete()
    client.end()
  },

  'DAY 0: create account' (client) {
    client.url(devServer)
    client.waitForElementPresent('body', 1000)

    let home = client.page.home()
    home.waitForElementPresent('@createButton', 4000)
    home.setValue('@teamNameInput', 'my-team')
    home.setValue('@passwordInput', 'password')
    home.click('@createButton')
    home.waitForElementNotPresent('@createButton', 4000)
  },

  'lists' (client) {
    let team = client.page.team()

    team.addList()
    team.list('1').rename('list1')
    team.list('1').toHaveName('list1')

    team.list('1').addItem('item1')
    team.list('1').item('1').toHaveName('item1')

    team.addList()
    team.list('2').rename('list2')
    team.list('2').toHaveName('list2')

    team.list('1').addItem('item2')
    team.list('1').item('2').toHaveName('item2')
    team.list('2').addItem('item3')
    team.list('2').item('1').toHaveName('item3')

    team.list('2').item('1').check()
    team.list('2').item('1').toBeChecked()

    team.list('1').item('1').remove()
    team.list('1').item('1').toHaveName('item2')
    team.list('1').remove()
    team.list('1').toHaveName('list2')

    team.list('1').item('2').rename('renamed3')
    team.list('1').item('2').toHaveName('renamed3')

    team.list('1').item('1').uncheck()
    team.list('1').item('1').toBeUnchecked()
  },

  'DAY 0: create team members and tracks' (client) {
    let team = client.page.team()
    team.waitForElementPresent('@title', 2000)
    team.assert.containsText('@title', 'MY-TEAM')

    team.track('track-1').add()
    team.track('track-2').add()
    team.track('track-3').add()

    team.track('track-1').toBeUnassigned()
    team.track('track-2').toBeUnassigned()
    team.track('track-3').toBeUnassigned()

    team.role('role-1').add()
    team.role('role-2').add()
    team.role('role-3').add()

    team.role('role-1').toBeUnassigned()
    team.role('role-2').toBeUnassigned()
    team.role('role-3').toBeUnassigned()

    for (var i = 1; i <= 6; i++) {
      team.person(`person-${i}`).add()
    }

    for (i = 1; i <= 6; i++) {
      team.person(`person-${i}`).toBeUnassigned()
    }
  },

  'DAY 1: allocate people' (client) {
    let team = client.page.team()

    team.person('person-1').moveToLane('last()')
    team.person('person-2').moveToLane('1')
    team.person('person-3').moveToLane('last()')
    team.person('person-4').moveToLane('2')
    team.person('person-2').moveToLane('2')
    team.person('person-4').moveToLane('1')

    team.person('person-6').moveToOut()

    team.lane('1').toHavePeople('person-1', 'person-4')
    team.lane('2').toHavePeople('person-3', 'person-2')

    team.person('person-5').toBeUnassigned()

    team.person('person-6').toBeOut()

    team.track('track-1').moveToLane('1')
    team.track('track-2').moveToLane('2')

    team.track('track-1').toBeInLane('1')
    team.track('track-2').toBeInLane('2')

    team.role('role-1').moveToLane('1')
    team.role('role-2').moveToLane('2')
    team.role('role-3').moveToLane('1')

    team.role('role-1').toBeInLane('1')
    team.role('role-2').toBeInLane('2')
    team.role('role-3').toBeInLane('1')

    team.waitADay()
  },

  'DAY 2: allocate people' (client) {
    let team = client.page.team()

    team.person('person-3').moveToLane('3')
    team.person('person-4').moveToLane('2')
    team.person('person-5').moveToLane('1')

    team.lane('1').toHavePeople('person-1', 'person-5')
    team.lane('2').toHavePeople('person-2', 'person-4')
    team.lane('3').toHavePeople('person-3')

    team.waitADay()
  },

  'DAY 3: delete some elements and recommend' (client) {
    let team = client.page.team()

    team.role('role-3').delete()
    team.track('track-3').delete()
    team.person('person-5').delete()

    team.role('role-3').notToExist()
    team.track('track-3').notToExist()
    team.person('person-5').notToExist()

    team.person('person-1').edit('renamed-1')
    team.person('person-1').notToExist()

    team.lane('1').toHavePeople('renamed-1')
    team.lane('2').toHavePeople('person-2', 'person-4')
    team.lane('3').toHavePeople('person-3')

    team.recommendPairs()

    team.expectMessage('Cannot make a valid pairing assignment. Do you have too many lanes?', 'warning')

    team.person('person-3').moveToUnassigned()

    team.recommendPairs()

    team.lane('1').toHavePeople('renamed-1', 'person-2')
    team.lane('2').toHavePeople('person-4', 'person-3')
    team.role('role-1').toBeInLane('1')
    team.role('role-2').toBeInLane('2')

    team.person('person-2').moveToLane('2')
    team.person('person-3').moveToUnassigned()

    team.recommendPairs()
    team.recommendPairs()
    team.recommendPairs()
    team.expectMessage('Pairing setting is already the optimal one. No actions taken', 'accent')

    team.waitADay()
  },

  'DAY 3: navigating back, logout, login' (client) {
    client.url(devServer)
    client.pause(1000)

    let team = client.page.team()
    team.waitForElementPresent('@title', 2000)
    team.assert.containsText('@title', 'MY-TEAM')

    client.assert.urlContains('my-team')

    team.logout()
    team.waitForElementNotPresent('@moreMenuButton', 2000)

    client.url(`${devServer}my-team`)
    team.expectMessage('You need to be logged in to access this page.', 'error')
    team.waitForElementNotPresent('@title', 2000)

    let home = client.page.home()
    home.waitForElementPresent('@teamNameInput', 2000)

    home.setValue('@teamNameInput', 'my-team')
    home.setValue('@passwordInput', 'password')
    home.click('@loginButton')
    home.waitForElementNotPresent('@loginButton', 2000)

    team.waitForElementPresent('@title', 2000)
    team.assert.containsText('@title', 'MY-TEAM')
    client.assert.urlContains('my-team')

    client.url(`${devServer}your-team`)
    team.expectMessage('You do not have access to this team.', 'error')
    team.waitForElementPresent('@title', 2000)

    team.assert.containsText('@title', 'MY-TEAM')
    client.assert.urlContains('my-team')

    team.waitADay()
  },

  'DAY 4: locks and recommend' (client) {
    let team = client.page.team()

    team.lockLane('1')
    team.person('person-2').moveToUnassigned()

    team.recommendPairs()

    team.lane('1').toHavePeople('renamed-1')
    team.lane('2').toHavePeople('person-3', 'person-2')
    team.lane('3').toHavePeople('person-4')
    team.role('role-1').toBeInLane('1')
    team.role('role-2').toBeInLane('2')
  },

  'DAY 5: sweeps' (client) {
    let team = client.page.team()

    team.sweepLane('2')

    team.role('role-2').toBeUnassigned()
    team.track('track-2').toBeUnassigned()
    team.person('person-3').toBeUnassigned()
    team.person('person-2').toBeUnassigned()
  },
}

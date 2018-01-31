var util = require("util")

module.exports = {
  commands: [{
    addTrack(name) {
      this.click("@addTrackButton")
        .waitForElementVisible("input[type='text']", 2000)
      this.api.keys([name, this.api.Keys.ENTER])
      this.waitForElementNotPresent("input[type='text']", 2000)
    },
    addRole(name) {
      this.click("@addRoleButton")
        .waitForElementVisible("input[type='text']", 2000)
      this.api.keys([name, this.api.Keys.ENTER])
      this.waitForElementNotPresent("input[type='text']", 2000)
    },
    addPerson(name) {
      this.click("@addPersonButton")
        .waitForElementVisible("input[type='text']", 2000)
      this.api.keys([name, this.api.Keys.ENTER])
      this.waitForElementNotPresent("input[type='text']", 1000)
    },
    el(elementName, data) {
      var element = this.elements[elementName.slice(1)]
      return util.format(element.selector, data)
    },
  }],
  elements: {
    title: "nav .toolbar__title",
    addTrackButton: {
      selector: "//*[contains(@class, 'tracks')]//button[//i[contains(@class, 'mdi-plus')]]",
      locateStrategy: "xpath",
    },
    addRoleButton: {
      selector: "//*[contains(@class, 'roles')]//button[//i[contains(@class, 'mdi-plus')]]",
      locateStrategy: "xpath",
    },
    addPersonButton: {
      selector: "//*[contains(@class, 'people')]//button[//i[contains(@class, 'mdi-plus')]]",
      locateStrategy: "xpath",
    },
    personCard: {
      selector: "//*[text()='%s']//ancestor::*[contains(@class, 'person')]",
      locateStrategy: "xpath",
    },
  },
}

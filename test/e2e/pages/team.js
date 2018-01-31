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

    movePersonToLane(name, lane) {
      this.api
        .useXpath()
        .moveToElement(this.el("@personCard", name),  50,  50)
        .mouseButtonDown(0)
        .moveToElement(this.el("@lane", lane),  75,  100)
        .mouseButtonUp(0)
    },

    movePersonToOut(name) {
      this.api
        .useXpath()
        .moveToElement(this.el("@personCard", name),  50,  50)
        .mouseButtonDown(0)
        .moveToElement(this.el("@outPeople"),  75,  100)
        .mouseButtonUp(0)
    },

    expectLaneHasPerson(lane, name) {
      this.api
        .useXpath()
        .expect
        .element(
          this.el("@lane", lane) +
          this.el("@personCard", name),
        )
        .to.be.present
    },

    expectPersonIsUnassigned(name) {
      this.api
        .useXpath()
        .expect
        .element(
          this.el("@unassignedPeople") +
          this.el("@personCard", name),
        )
        .to.be.present
    },

    expectPersonIsOut(name) {
      this.api
        .useXpath()
        .expect
        .element(
          this.el("@outPeople") +
          this.el("@personCard", name),
        )
        .to.be.present
    },

    el(elementName, data) {
      var element = this.elements[elementName.slice(1)]
      if (!data) {
        return element.selector
      }
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

    lane: {
      selector: "(//li[contains(@class, 'lane')])[%s]",
      locateStrategy: "xpath",
    },

    unassignedPeople: {
      selector: "//*[contains(@class, 'people') and contains(@class, 'unassigned')]",
      locateStrategy: "xpath",
    },

    outPeople: {
      selector: "//*[contains(@class, 'people') and contains(@class, 'out')]",
      locateStrategy: "xpath",
    },
  },
}

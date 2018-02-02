var util = require("util")
var pluralize = require("pluralize")

module.exports = {
  commands: [{
    track(name) {
      return this.entity("tracks", name)
    },

    role(name) {
      return this.entity("roles", name)
    },

    person(name) {
      return this.entity("people", name)
    },

    saveHistory() {
      this.click("@saveHistoryButton")
      this.api.pause(2000)

      this.api.useCss()
        .expect
        .element(".snack div")
        .text.to.contain("History recorded!")
        .before(2000)
    },

    expectError(errorMsg) {
      this.api.useCss()
        .expect
        .element(".snack div")
        .text.to.contain(errorMsg)
        .before(2000)
    },

    recommendPairs() {
      this.click("@recommendPairsButton")
    },

    el(elementName, data) {
      var element = this.elements[elementName.slice(1)]
      if (!data) {
        return element.selector
      }
      return util.format(element.selector, data)
    },

    assertChildOf(child, parent) {
      return this.api.useXpath().expect.element(parent + child).to.be.present.before(2000)
    },

    move(el, destination) {
      return this.api.useXpath()
        .moveToElement(el,  0,  0)
        .mouseButtonDown(0)
        .moveToElement(destination,  50,  50)
        .mouseButtonUp(0)
    },

    rightClick(el) {
      return this.api.useXpath()
        .moveToElement(el,  0,  0)
        .mouseButtonClick("right")
    },

    entity(type, name) {
      var self = this
      var singular = pluralize.singular(type)
      var plural = pluralize.plural(type)
      var element = this.el(`@${singular}`, name)

      return {
        add(picture) {
          self.click(`@add${self.capitalize(singular)}Button`)
            .waitForElementVisible("input[type='text']", 2000)
            .setValue("input[type='text']", name)

          if (picture) {
            self.api.setValue("input[type='url']", picture)
          }

          return self.api.keys([self.api.Keys.ENTER])
            .waitForElementNotPresent("input[type='text']", 1000)
        },

        moveToLane(lane) {
          return self.move(element, self.el("@lane", lane))
        },

        moveToOut() {
          return self.move(element, self.el(`@out${self.capitalize(plural)}`))
        },

        moveToUnassigned() {
          return self.move(element, self.el(`@unassigned${self.capitalize(plural)}`))
        },

        edit(newName, newPicture) {
          self.rightClick(element)
          self.api
            .useXpath()
            .waitForElementPresent("//a//div[contains(text(), 'Edit')]", 2000)
            .pause(500)
            .click("//a//div[contains(text(), 'Edit')]")
            .useCss()
            .waitForElementVisible("input[type='text']", 2000)
            .pause(500)
            .clearValue("input[type='text']")
            .setValue("input[type='text']", newName)

          if (newPicture) {
            self.api
              .clearValue("input[type='url']")
              .setValue("input[type='url']", newPicture)
          }

          return self.api.keys([self.api.Keys.ENTER])
            .waitForElementNotPresent("input[type='text']", 1000)
            .pause(500)
        },

        delete() {
          self.rightClick(element)
          self.api
            .useXpath()
            .waitForElementPresent("//a//div[contains(text(), 'Remove')]", 2000)
            .pause(500)
            .click("//a//div[contains(text(), 'Remove')]")
            .waitForElementPresent("//button//div[text()='Yes']", 2000)
            .pause(500)
            .click("//button//div[text()='Yes']")
            .waitForElementNotPresent("//button//div[text()='Yes']", 2000)
        },

        notToExist() {
          return self.api.useXpath().expect.element(element).to.not.be.present
        },

        toBeOut() {
          return self.assertChildOf(element, self.el(`@out${self.capitalize(plural)}`))
        },

        toBeUnassigned() {
          return self.assertChildOf(element, self.el(`@unassigned${self.capitalize(plural)}`))
        },

        toBeInLane(lane) {
          return self.assertChildOf(element, self.el("@lane", lane))
        },
      }
    },

    capitalize(string) {
      return string.charAt(0).toUpperCase() + string.slice(1)
    },
  }],

  elements: {
    title: "nav .toolbar__title",

    saveHistoryButton: {
      selector: "//nav[contains(@class, 'toolbar')]//i[contains(@class, 'mdi-content-save')]//ancestor::button",
      locateStrategy: "xpath",
    },

    recommendPairsButton: {
      selector: "//nav[contains(@class, 'toolbar')]//i[contains(@class, 'mdi-shuffle-variant')]//ancestor::button",
      locateStrategy: "xpath",
    },

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

    person: {
      selector: "//*[contains(@class, 'person')]//*[text()='%s']",
      locateStrategy: "xpath",
    },

    track: {
      selector: "//*[contains(@class, 'track')]//*[text()='%s']",
      locateStrategy: "xpath",
    },

    role: {
      selector: "//*[contains(@class, 'role')]//*[text()='%s']",
      locateStrategy: "xpath",
    },

    lane: {
      selector: "(//li[contains(@class, 'lane')])[%s]",
      locateStrategy: "xpath",
    },

    unassignedTracks: {
      selector: "//*[contains(@class, 'tracks') and contains(@class, 'unassigned')]",
      locateStrategy: "xpath",
    },

    unassignedRoles: {
      selector: "//*[contains(@class, 'roles') and contains(@class, 'unassigned')]",
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

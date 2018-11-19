const util = require('util')
const pluralize = require('pluralize')
const _ = require('lodash/fp')

module.exports = {
  commands: [{
    waitADay () {
      this.api.pause(15000)
    },

    track (name) {
      return this.entity('tracks', name)
    },

    role (name) {
      return this.entity('roles', name)
    },

    person (name) {
      return this.entity('people', name)
    },

    addList () {
      this.api.useCss().click('#add-list')
    },

    list (index) {
      let self = this
      let element = this.el('@list', index)

      return {
        rename (newName) {
          self.api.useXpath()
            .waitForElementPresent(
              `(${element}//div[@contenteditable = 'true'])[1]`,
              10000,
            )

          self.api.useXpath()
            .click(`(${element}//div[@contenteditable = 'true'])[1]`)
            .pause(300)
            .keys([newName, self.api.Keys.ENTER])
        },

        toHaveName (name) {
          self.api.useXpath()
            .assert
            .containsText(element + "//div[@contenteditable = 'true']", name)
        },

        addItem (item) {
          self.api.useXpath()
            .click(element + "//button[contains(@class, 'add-item')]")
            .keys([item, self.api.Keys.ENTER])
        },

        remove () {
          self.api.useXpath()
            .click(`${element}//button[contains(@class, 'remove-list')]`)
            .waitForElementPresent("//button//div[text()='Yes']", 2000)
            .pause(500)
            .click("//button//div[text()='Yes']")
            .waitForElementNotPresent("//button//div[text()='Yes']", 2000)
        },

        item (index) {
          let item = `(${element}//div[contains(@class, 'v-list__tile ')])[${index}]`

          return {
            toHaveName (name) {
              self.api.useXpath()
                .assert
                .containsText(item, name)
            },

            rename (name) {
              self.api.useXpath()
                .click(`${item}//div[@contenteditable = 'true']`)
                .keys([name, self.api.Keys.ENTER])
            },

            check () {
              self.api.useXpath()
                .click(`${item}//*[@role = 'checkbox']/parent::*`)
                .pause(300)
            },

            uncheck () {
              self.api.useXpath()
                .click(`${item}//*[@role = 'checkbox']/parent::*`)
                .pause(300)
            },

            toBeChecked () {
              self.api.useXpath()
                .assert
                .attributeContains(
                  `${item}//*[@role = 'checkbox']`,
                  'aria-checked',
                  'true',
                )
            },

            toBeUnchecked () {
              self.api.useXpath()
                .assert
                .attributeContains(
                  `${item}//*[@role = 'checkbox']`,
                  'aria-checked',
                  'false',
                )
            },

            remove () {
              self.api.useXpath()
                .click(`${item}//button[contains(@class, 'remove-item')]`)
            },
          }
        },
      }
    },

    lane (lane) {
      let self = this
      let element = this.el('@lane', lane)

      return {
        toHavePeople (...peopleNames) {
          let i = 0
          _.forEach(person => {
            self.api
              .useXpath()
              .assert
              .containsText(
                element + `//*[contains(@class, 'person')][${++i}]`,
                person
              )
          }, peopleNames)
        },
      }
    },

    logout () {
      this.click('@moreMenuButton')
      this.api
        .useXpath()
        .waitForElementPresent("//a//div[contains(text(), 'Logout')]", 2000)
        .pause(500)
        .click("//a//div[contains(text(), 'Logout')]")
        .pause(500)
    },

    lockLane (lane) {
      this.api
        .useXpath()
        .moveToElement(this.el('@lane', lane), 50, 50)
        .pause(300)
        .click(this.el('@lane', lane) + "//i[contains(@class, 'mdi-lock-open')]//ancestor::button")
        .useCss()
        .waitForElementVisible('.lock-button .is-locked', 2000)
        .pause(300)
    },

    sweepLane (lane) {
      this.api
        .useXpath()
        .moveToElement(this.el('@lane', lane), 50, 50)
        .pause(300)
        .click(this.el('@lane', lane) + "//i[contains(@class, 'mdi-broom')]//ancestor::button")
        .useCss()
        .waitForElementNotPresent(this.el('@lane', lane), 2000)
        .pause(300)
    },

    expectMessage (msg, type) {
      this.api.pause(300)
      this.api.useCss()
        .waitForElementPresent('.v-snack.v-snack--top .mdi-close', 2000)

      this.api.useCss()
        .assert
        .containsText('.v-snack.v-snack--top div', msg)

      this.api.useCss()
        .assert
        .cssClassPresent('.v-snack.v-snack--top .v-snack__wrapper', type)

      this.api.click('.v-snack.v-snack--top .mdi-close')
    },

    recommendPairs () {
      this.click('@recommendPairsButton')
    },

    el (elementName, data) {
      let element = this.elements[elementName.slice(1)]
      if (!data) {
        return element.selector
      }
      return util.format(element.selector, data)
    },

    assertChildOf (child, parent) {
      return this.api.useXpath().waitForElementPresent(parent + child, 2000)
    },

    move (el, destination) {
      return this.api.useXpath()
        .moveToElement(el, 0, 0)
        .mouseButtonDown(0)
        .moveToElement(destination, 50, 50)
        .mouseButtonUp(0)
        .pause(500)
    },

    rightClick (el) {
      return this.api.useXpath()
        .moveToElement(el, 0, 0)
        .mouseButtonClick('right')
    },

    entity (type, name) {
      let self = this
      let singular = pluralize.singular(type)
      let plural = pluralize.plural(type)
      let element = this.el(`@${singular}`, name)

      return {
        add (picture) {
          self.click(`@add${self.capitalize(singular)}Button`)

          self.api.useCss()
            .waitForElementVisible("input[type='text']", 2000)
            .setValue("input[type='text']", name)

          if (picture) {
            self.api.setValue("input[type='url']", picture)
          }

          return self.api.keys([self.api.Keys.ENTER])
            .waitForElementNotPresent("input[type='text']", 2000)
        },

        moveToLane (lane) {
          return self.move(element, self.el('@lane', lane))
        },

        moveToOut () {
          return self.move(element, self.el(`@out${self.capitalize(plural)}`))
        },

        moveToUnassigned () {
          return self.move(element, self.el(`@unassigned${self.capitalize(plural)}`))
        },

        edit (newName, newPicture) {
          self.api
            .useXpath()
            .moveToElement(element, 10, 10)
            .pause(200)
            .click(element + "/../..//button[contains(@class, 'edit-hover')]")
          self.api
            .useXpath()
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
            .waitForElementNotPresent("input[type='text']", 2000)
            .pause(500)
        },

        delete () {
          self.api
            .useXpath()
            .moveToElement(element, 10, 10)
            .pause(200)
            .click(element + "/../..//button[contains(@class, 'edit-hover')]")
          self.api
            .useXpath()
            .waitForElementPresent("//button//div[contains(text(), 'Remove')]", 2000)
            .pause(500)
            .click("//button//div[contains(text(), 'Remove')]")
            .waitForElementPresent("//button//div[text()='Yes']", 2000)
            .pause(500)
            .click("//button//div[text()='Yes']")
            .waitForElementNotPresent("//button//div[text()='Yes']", 2000)
        },

        notToExist () {
          return self.api.useXpath().waitForElementNotPresent(element, 2000)
        },

        toBeOut () {
          return self.assertChildOf(element, self.el(`@out${self.capitalize(plural)}`))
        },

        toBeUnassigned () {
          return self.assertChildOf(element, self.el(`@unassigned${self.capitalize(plural)}`))
        },

        toBeInLane (lane) {
          return self.assertChildOf(element, self.el('@lane', lane))
        },
      }
    },

    capitalize (string) {
      return _.toUpper(string.charAt(0)) + string.slice(1)
    },
  }],

  elements: {
    title: 'nav .v-toolbar__title span:nth-child(2)',

    recommendPairsButton: {
      selector: "//nav[contains(@class, 'toolbar')]//i[contains(@class, 'mdi-shuffle-variant')]//ancestor::button",
      locateStrategy: 'xpath',
    },

    moreMenuButton: {
      selector: "//nav[contains(@class, 'toolbar')]//i[text()='more_vert']//ancestor::button",
      locateStrategy: 'xpath',
    },

    addTrackButton: {
      selector: "//*[contains(@class, 'tracks')]//button[//i[contains(@class, 'mdi-plus')]]",
      locateStrategy: 'xpath',
    },

    addRoleButton: {
      selector: "//*[contains(@class, 'roles')]//button[//i[contains(@class, 'mdi-plus')]]",
      locateStrategy: 'xpath',
    },

    addPersonButton: {
      selector: "//*[contains(@class, 'people')]//button[//i[contains(@class, 'mdi-plus')]]",
      locateStrategy: 'xpath',
    },

    person: {
      selector: "//*[contains(@class, 'person')]//*[text()='%s']/..",
      locateStrategy: 'xpath',
    },

    track: {
      selector: "//*[contains(@class, 'track')]//*[text()='%s']",
      locateStrategy: 'xpath',
    },

    role: {
      selector: "//*[contains(@class, 'role')]//*[text()='%s']",
      locateStrategy: 'xpath',
    },

    list: {
      selector: "(//div[contains(@class, 'lists')]//div[@class = 'list'])[%s]",
      locateStrategy: 'xpath',
    },

    lane: {
      selector: "(//div[contains(concat(' ', @class, ' '), ' lane ')])[%s]",
      locateStrategy: 'xpath',
    },

    unassignedTracks: {
      selector: "//*[contains(@class, 'tracks') and contains(@class, 'unassigned')]",
      locateStrategy: 'xpath',
    },

    unassignedRoles: {
      selector: "//*[contains(@class, 'roles') and contains(@class, 'unassigned')]",
      locateStrategy: 'xpath',
    },

    unassignedPeople: {
      selector: "//*[contains(@class, 'people') and contains(@class, 'unassigned')]",
      locateStrategy: 'xpath',
    },

    outPeople: {
      selector: "//*[contains(@class, 'people') and contains(@class, 'out')]",
      locateStrategy: 'xpath',
    },
  },
}

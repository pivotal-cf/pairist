module.exports = {
  elements: {
    teamNameInput: "input[type='text']",
    passwordInput: "input[type='password']",
    createButton: {
      selector: "//*[contains(text(), 'create')]/parent::button",
      locateStrategy: 'xpath',
    },
    loginButton: {
      selector: "//*[contains(text(), 'login')]/parent::button",
      locateStrategy: 'xpath',
    },
  },
}

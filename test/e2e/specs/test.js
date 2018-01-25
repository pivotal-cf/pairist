// For authoring Nightwatch tests, see
// http://nightwatchjs.org/guide#usage

module.exports = {
  "default e2e tests": function(client) {
    // automatically uses dev Server port from /config.index.js
    // default: http://localhost:8080
    // see nightwatch.conf.js
    const devServer = client.globals.devServerURL

    client.url(devServer)
    client.expect.element("body").to.be.present.before(1000)
    client.expect.element("h1").text.to.contain("Welcome to Your Vue.js App")
    client.setValue("input[type=text]", "my-team")
    client.click("nav .navbar-start .navbar-item:nth-child(2) button")
    client.expect
      .element("#content")
      .text.to.contain("my-team")
      .before(1000)
    client.end()
  },
}

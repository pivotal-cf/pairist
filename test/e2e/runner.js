process.env.NODE_ENV = "testing"

const webpack = require("webpack")
const DevServer = require("webpack-dev-server")

const webpackConfig = require("../../build/webpack.prod.conf")

const isPortAvailable = require("is-port-available")

let server
const port = process.env.PORT || 12000

isPortAvailable(port).then(status => {
  if(status) {
    const devConfigPromise = require("../../build/webpack.dev.conf")
    devConfigPromise.then(devConfig => {
      const devServerOptions = devConfig.devServer
      const host = devServerOptions.host
      const compiler = webpack(webpackConfig)

      server = new DevServer(compiler, devServerOptions)
      return server.listen(port, host)
    })
  }
})
  .then(() => {
    let opts = process.argv.slice(2)
    if (opts.indexOf("--config") === -1) {
      opts = opts.concat(["--config", "test/e2e/nightwatch.conf.js"])
    }
    if (opts.indexOf("--env") === -1) {
      opts = opts.concat(["--env", "chrome"])
    }

    const spawn = require("cross-spawn")
    const runner = spawn("./node_modules/.bin/nightwatch", opts, { stdio: "inherit" })

    runner.on("exit", function (code) {
      if (server) {
        server.close()
      }
      process.exit(code)
    })

    runner.on("error", function (err) {
      if (server) {
        server.close()
      }
      throw err
    })
  })

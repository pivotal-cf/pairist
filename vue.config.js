module.exports = {
  chainWebpack: config => {
    config
      .plugin('define')
      .tap(args => {
        Object.assign(args[0]['process.env'], { VUE_APP_VERSION: Date.now() })
        return args
      })
  },
}

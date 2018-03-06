module.exports = {
  page_objects_path: ['test/e2e/pages'],
  test_settings: {
    default: {
      screenshots: {
        enabled: true,
        on_failure: true,
        on_error: true,
        path: '/tmp/nightwatchscreenshots',
      },
    },

    chrome: {
      desiredCapabilities: {
        chromeOptions: {
          args: [
            'headless',
            'disable-web-security',
            'ignore-certificate-errors',
            'window-size=1280,1080',
          ],
        },
      },
    },
  },
}

if (!Boolean(process.env.REACT_APP_FIREBASE_PROJECT_ID)) {
  throw 'REACT_APP_FIREBASE_PROJECT_ID is not set.';
}

if (!Boolean(process.env.REACT_APP_FIREBASE_API_KEY)) {
  throw 'REACT_APP_FIREBASE_API_KEY is not set.';
}

if (!Boolean(process.env.REACT_APP_FIREBASE_AUTH_DOMAIN)) {
  throw 'REACT_APP_FIREBASE_AUTH_DOMAIN is not set.';
}

if (!Boolean(process.env.REACT_APP_FIREBASE_URL)) {
  throw 'REACT_APP_FIREBASE_URL is not set.';
}

module.exports = {
  reactScriptsVersion: 'react-scripts',
  webpack: {
    configure: (webpackConfig) => {
      webpackConfig.module.rules.push({
        test: /\.(js|mjs|jsx|ts|tsx)$/,
        use: [
          {
            loader: 'astroturf/loader',
            options: { extension: '.module.scss' },
          },
        ],
      });

      return webpackConfig;
    },
  },
};

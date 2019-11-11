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

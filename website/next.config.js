// eslint-disable-next-line @typescript-eslint/no-var-requires
const withNextra = require('nextra')({
  theme: 'nextra-theme-docs',
  themeConfig: './theme.config.js',
});

const isProd = process.env.NODE_ENV === 'production';

const nextraConfig = withNextra({
  reactStrictMode: true,

  experiments: {
    swcLoader: true,
    swcMinify: true,
  },
  async redirects() {
    return [
      {
        source: '/docs/changelog',
        destination: 'https://github.com/conceptadev/rockets/releases',
        permanent: true,
      },
    ];
  },
});

module.exports = { ...nextraConfig, assetPrefix: isProd ? '/rockets/' : '' };

// eslint-disable-next-line @typescript-eslint/no-var-requires
const withNextra = require('nextra')({
  theme: 'nextra-theme-docs',
  themeConfig: './theme.config.js',
});

const isProd = process.env.NODE_ENV === 'production';

module.exports = withNextra({
  reactStrictMode: true,
  assetPrefix: isProd ? '/Next-gh-page-example/' : '',
  distDir: 'build',
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

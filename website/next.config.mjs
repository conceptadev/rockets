// eslint-disable-next-line @typescript-eslint/no-var-requires
import nextra from 'nextra';

const withNextra = nextra({
  theme: 'nextra-theme-docs',
  themeConfig: './theme.config.js',
  mdxOptions: { remarkPlugins: [] },
});

export default withNextra({
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

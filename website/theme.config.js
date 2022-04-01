const themeConfig = {
  github: 'https://github.com/conceptadev/rockets',
  docsRepositoryBase: 'https://github.com/conceptadev/rockets/blob/main',
  search: true,
  // customSearch: <CustomSearch />,
  titleSuffix: ' – Rockets',
  floatTOC: true,
  logo: (
    <>
      <img
        className="md:inline object-contain hidden"
        height={16}
        width={16}
        alt="Rockets Logo"
        src={'/assets/rockets-icon.svg'}
      />
      <span className="mr-2 font-extrabold mx-2 hidden md:inline">Rockets</span>
      {/* <span className="text-gray-600 font-normal text-sm hidden md:inline">
        Rapid Enterprise Development Toolkit
      </span> */}
    </>
  ),
  head: (
    <>
      <meta name="msapplication-TileColor" content="#ffffff" />
      <meta name="theme-color" content="#ffffff" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta httpEquiv="Content-Language" content="en" />
      <meta
        name="description"
        content="Rockets: Rapid Enterprise Development Toolkit"
      />
      <meta
        name="og:description"
        content="Rockets: Rapid Enterprise Development Toolkit"
      />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:image" content="https://rockets.tools/og.png" />
      <meta name="twitter:site:domain" content="rockets.tools" />
      <meta name="twitter:url" content="https://rockets.tools" />
      <meta
        name="og:title"
        content="Rockets: Rapid Enterprise Development Toolkit"
      />
      <meta name="og:image" content="https://rockets.tools/og.png" />
      <meta name="apple-mobile-web-app-title" content="Rockets" />
      <link
        rel="apple-touch-icon"
        sizes="180x180"
        href="/apple-icon-180x180.png"
      />
      <link
        rel="icon"
        type="image/png"
        sizes="192x192"
        href="/android-icon-192x192.png"
      />
      <link
        rel="icon"
        type="image/png"
        sizes="32x32"
        href="/favicon-32x32.png"
      />
      <link
        rel="icon"
        type="image/png"
        sizes="16x16"
        href="/favicon-16x16.png"
      />
      <link rel="manifest" href="/site.webmanifest" />
      <meta name="msapplication-TileImage" content="/ms-icon-150x150.png" />
    </>
  ),

  prevLinks: true,
  nextLinks: true,
  footer: true,
  footerEditLink: 'Edit this page on GitHub',
  footerText: (
    <>
      <span>
        {'2022 © '}
        <a href="https://conceptatech.com" target="_blank" rel="noreferrer">
          {' Concepta'}
        </a>
      </span>
    </>
  ),
  unstable_faviconGlyph: '👋',
};

export default themeConfig;

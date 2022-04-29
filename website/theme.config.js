import CustomSearch from './components/Search';

const themeConfig = {
  github: 'https://github.com/conceptadev/rockets',
  projectLink: 'https://github.com/conceptadev/rockets',

  docsRepositoryBase: 'https://github.com/conceptadev/rockets/blob/main',
  search: true,
  customSearch: <CustomSearch />,
  titleSuffix: ' – Rockets',
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
      <meta name="twitter:image" content="https://www.rockets.tools/og.png" />
      <meta name="twitter:site:domain" content="rockets.tools" />
      <meta name="twitter:url" content="https://www.rockets.tools" />
      <meta
        name="og:title"
        content="Rockets: Rapid Enterprise Development Toolkit"
      />
      <meta name="og:image" content="https://www.rockets.tools/og.png" />
      <meta name="apple-mobile-web-app-title" content="Rockets" />
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />

      <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=Roboto&display=swap"
        rel="stylesheet"
      />
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
      <script
        async
        src={`https://www.googletagmanager.com/gtag/js?id=G-E2EF28D6TS`}
      />
      <script
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-E2EF28D6TS', {
              page_path: window.location.pathname,
            });
          `,
        }}
      />
    </>
  ),

  prevLinks: true,
  nextLinks: true,
  floatTOC: true,
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
};

export default themeConfig;

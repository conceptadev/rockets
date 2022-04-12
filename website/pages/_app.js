(typeof global !== 'undefined' ? global : window).Prism = Prism;
import Prism from 'prism-react-renderer/prism';
import React from 'react';
import '../global.css';

require('prismjs/components/prism-typescript');

export default function MyApp({ Component, pageProps }) {
  // Use the layout defined at the page level, if available
  const getLayout = Component.getLayout || ((page) => page);

  return getLayout(<Component {...pageProps} />);
}

(typeof global !== 'undefined' ? global : window).Prism = Prism;
import Prism from 'prism-react-renderer/prism';
import React from 'react';
import '../global.css';

require('prismjs/components/prism-typescript');

export default function Nextra({ Component, pageProps }) {
  return <Component {...pageProps} />;
}

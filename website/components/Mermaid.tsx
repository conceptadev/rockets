import mermaid from 'mermaid';
import { useTheme } from 'next-themes';
import React, { useEffect, useRef } from 'react';

//
// https://github.com/mermaid-js/mermaid/blob/develop/src/defaultConfig.js
//

type Props = {
  chart: string;
  config?: Record<string, unknown>;
};

/**
 * Mermaid initializer
 */
function initMermaid(
  theme: string,
  systemTheme: string,
  config: Props['config'],
) {
  const renderedTheme = theme === 'system' ? systemTheme : theme;

  mermaid.initialize({
    theme: renderedTheme === 'dark' ? 'dark' : 'neutral',
    fontFamily: 'Roboto, "trebuchet ms", verdana, arial, sans-serif;',
    flowchart: {
      curve: 'basis',
      nodeSpacing: 50,
      rankSpacing: 50,
    },
    ...config,
  });
}

const Mermaid: React.FC<Props> = ({ chart, config }: Props) => {
  // must have a chart
  if (!chart) return null;

  // track the element we will render
  const mermaidRef = useRef(null);

  // get theme data from hook
  const { theme, systemTheme } = useTheme();

  // render the content depending on theme
  useEffect(() => {
    // does ref have children already?
    if (mermaidRef?.current?.childElementCount) {
      // yes, need to re-render
      mermaidRef.current.removeAttribute('data-processed');
      // set raw chart data (again)
      mermaidRef.current.innerHTML = chart;
      // update configuration
      initMermaid(theme, systemTheme, config);
    }

    // render
    mermaid.contentLoaded();
  }, [theme]);

  return (
    <div className="mermaid pt-0 sm:pt-4" ref={mermaidRef}>
      {chart}
    </div>
  );
};

export default Mermaid;

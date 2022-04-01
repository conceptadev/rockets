/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-var-requires */
// This is needed because of the following issue on the typedoc plugin
// https://github.com/tgreyuk/typedoc-plugin-markdown/issues/252

const path = require('path');
const fs = require('fs');

const packagesDir = '../packages';

try {
  const packages = fs.readdirSync(packagesDir);

  const readmeName = 'README.md';

  packages.forEach((packageName) => {
    const readmePath = path.join(packagesDir, packageName, readmeName);

    const modulePath = path.join('./pages/documentation/modules', packageName);
    const outputPath = path.join(modulePath + '.md');

    if (!fs.existsSync(readmePath)) {
      return;
    }

    // if (!fs.existsSync(modulePath)) {
    //   fs.mkdirSync(modulePath, { recursive: true });
    // }

    const moduleReadme = fs.readFileSync(path.join(readmePath));

    fs.writeFileSync(outputPath, moduleReadme, { recursive: true });
  });
} catch (error) {
  console.error('Error occurred:', error);
}

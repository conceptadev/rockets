/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-var-requires */
// This is needed because of the following issue on the typedoc plugin
// https://github.com/tgreyuk/typedoc-plugin-markdown/issues/252

import path from 'path';
import * as fs from 'fs';
import fsExtra from 'fs-extra';
import { remark } from 'remark';
import remarkStripBadges from 'remark-strip-badges';
import remarkSqueezeParagraphs from 'remark-squeeze-paragraphs';

const packagesDir = '../packages';

async function main() {
  try {
    const packages = fs.readdirSync(packagesDir);

    const readmeName = 'README.md';

    const modulePath = path.join('./pages/documentation/modules');

    if (!fs.existsSync(modulePath)) {
      fs.mkdirSync(modulePath, { recursive: true });
    }

    const categories = {};

    for (const packageName of packages) {
      const websiteConfigPath = path.join(
        packagesDir,
        packageName,
        'website.json',
      );

      let websiteConfig;

      if (fs.existsSync(websiteConfigPath)) {
        const rawdata = fs.readFileSync(websiteConfigPath);
        websiteConfig = JSON.parse(rawdata);
      } else {
        continue;
      }

      const { meta, category } = websiteConfig;

      if (!categories[category]) {
        categories[category] = {};
      }

      categories[category][packageName] = meta;
    }

    for (const category in categories) {
      const categoryPackages = categories[category];
      const categoryMeta = {};

      for (const packageName in categoryPackages) {
        categoryMeta[packageName] = categoryPackages[packageName];

        const docDir = path.join(modulePath, category, packageName);
        const srcDocDir = path.join(packagesDir, packageName, 'doc');
        const readmePath = path.join(packagesDir, packageName, readmeName);

        if (fs.existsSync(srcDocDir)) {
          await fsExtra.copySync(srcDocDir, docDir);
        } else if (fs.existsSync(readmePath)) {
          const outputPath = path.join(
            modulePath,
            category,
            packageName + '.md',
          );
          const moduleReadme = fs.readFileSync(path.join(readmePath));
          const processed = await remark()
            .use(remarkStripBadges)
            .use(remarkSqueezeParagraphs)
            .process(moduleReadme);
          fs.writeFileSync(outputPath, String(processed), { recursive: true });
        } else {
          continue;
        }
      }

      // write the category meta json
      fs.writeFileSync(
        path.join(modulePath, category, 'meta.json'),
        JSON.stringify(categoryMeta, null, 2),
        {
          recursive: true,
        },
      );
    }
  } catch (error) {
    console.error('Error occurred:', error);
  }
}

main();

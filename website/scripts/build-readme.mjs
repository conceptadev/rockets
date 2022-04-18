/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-var-requires */
// This is needed because of the following issue on the typedoc plugin
// https://github.com/tgreyuk/typedoc-plugin-markdown/issues/252

import path from 'path';
import * as fs from 'fs';
import { remark } from 'remark';
import remarkStripBadges from 'remark-strip-badges';
import remarkSqueezeParagraphs from 'remark-squeeze-paragraphs';

async function main() {
  // location of packages
  const packagesDir = '../packages';

  // name of destination folder
  const modulesDest = 'api';

  try {
    // read all packages
    const packages = fs.readdirSync(packagesDir);

    // path to module docs
    const modulePath = `./pages/documentation/${modulesDest}`;

    // path to module toc list
    const moduleTocListOut = path.join(modulePath, '_toc_list.md');

    // read in the modules meta
    const modulesMeta = JSON.parse(
      fs.readFileSync(path.join(modulePath, 'meta.json')),
    );

    // read in the modules config
    const modulesConfig = JSON.parse(fs.readFileSync('modules.json'));

    // packages by category
    const pkgsByCategory = {};

    // packages toc
    const tocList = {
      type: 'list',
      ordered: false,
      start: 1,
      spread: false,
      children: [],
    };

    for (const packageName in modulesConfig) {
      // package was found?
      if (!packages.includes(packageName)) {
        continue;
      }

      // break out our vars
      const { title, category } = modulesConfig[packageName];

      // init category property if not exists
      if (!pkgsByCategory[category]) {
        pkgsByCategory[category] = {};
      }

      // set the meta data for the pacakge
      pkgsByCategory[category][packageName] = { title };
    }

    // loop all package categories
    for (const pkgCategory in pkgsByCategory) {
      const categoryDir = path.join(modulePath, pkgCategory);
      const categoryPackages = pkgsByCategory[pkgCategory];
      const categoryMeta = {};
      const categoryTocListOut = path.join(categoryDir, '_toc_list.md');

      // package toc by category
      const tocCategoryList = {
        type: 'list',
        ordered: false,
        start: 1,
        spread: false,
        children: [],
      };

      // create category dir if necessary
      fs.mkdirSync(categoryDir, { recursive: true });

      // loop all category packages
      for (const packageName in categoryPackages) {
        // add to category meta
        categoryMeta[packageName] = categoryPackages[packageName];

        // path to doc dir
        const docDir = path.join(categoryDir, packageName);

        // path to doc file
        const docFile = fs.existsSync(docDir)
          ? path.join(docDir, 'index.mdx')
          : path.join(categoryDir, packageName + '.mdx');

        // does a doc file exist?
        if (fs.existsSync(docFile)) {
          // yes, custom documentation has already been created
          continue;
        }

        // path to readme file (in package)
        const readmePath = path.join(packagesDir, packageName, 'README.md');

        // does a readme exist in the package?
        if (fs.existsSync(readmePath)) {
          // read source readme
          const moduleReadme = fs.readFileSync(readmePath);

          // strip badges and clean it up a bit
          const processor = remark()
            .use(remarkStripBadges)
            .use(remarkSqueezeParagraphs);
          const parsed = await processor.parse(moduleReadme);
          const cleaned = await processor.run(parsed);

          // update the toc
          tocCategoryList.children.push({
            type: 'listItem',
            spread: false,
            children: [
              {
                type: 'paragraph',
                children: [
                  {
                    type: 'link',
                    url: `/documentation/${modulesDest}/${pkgCategory}/${packageName}`,
                    title: packageName,
                    children: [{ type: 'text', value: packageName }],
                  },
                  {
                    type: 'text',
                    value: `- ${cleaned.children[1].children[0].value}`,
                  },
                ],
              },
            ],
          });

          // final processing
          const vfile = await processor.stringify(cleaned);

          // path to generated doc file
          const docFileMagic = fs.existsSync(docDir)
            ? path.join(docDir, 'index.md')
            : path.join(categoryDir, packageName + '.md');

          // write it
          fs.writeFileSync(docFileMagic, String(vfile));
        }
      }

      tocList.children.push({
        type: 'listItem',
        spread: false,
        children: [
          {
            type: 'text',
            value: modulesMeta[pkgCategory],
          },
          tocCategoryList,
        ],
      });

      // write the category meta json
      fs.writeFileSync(
        path.join(categoryDir, 'meta.json'),
        JSON.stringify(categoryMeta, null, 2),
      );

      // write the category toc markdown
      const tocCategoryMarkdown = remark().stringify(tocCategoryList);
      fs.writeFileSync(categoryTocListOut, tocCategoryMarkdown);
    }

    // write the toc markdown
    const tocMarkdown = remark().stringify(tocList);
    fs.writeFileSync(moduleTocListOut, tocMarkdown);
  } catch (error) {
    console.error('Error occurred:', error);
  }
}

main();

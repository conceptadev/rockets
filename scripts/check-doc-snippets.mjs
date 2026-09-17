import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

// README examples are the only instructions a consumer has: they install from
// npm and never see `src/`. A snippet that names a symbol the package does not
// export, or that omits the file it imports, is a broken install for them.
// This gate compiles every snippet that declares a file path against the built
// packages, so drift fails here instead of in someone else's terminal.
//
// Convention: a fenced `ts` block whose FIRST line is `// <path>.ts` is a real
// file and is compiled. Every other block is an illustrative fragment and is
// reported but not compiled — keep those short and prefer complete files.

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const workRoot = join(repositoryRoot, '.cache', 'doc-snippets');
const tsc = join(repositoryRoot, 'node_modules', '.bin', 'tsc');

const failures = [];
let compiledFiles = 0;
let fragments = 0;
let bootedProjects = 0;
let sentRequests = 0;
let exercisedRequests = 0;
const routelessDocuments = [];
let rejectedWrites = 0;
const bootedDocuments = [];

function documentPaths() {
  const docsIn = (root) =>
    readdirSync(join(repositoryRoot, root))
      .map((entry) => join(root, entry, 'README.md'))
      .filter((relative) => existsSync(join(repositoryRoot, relative)));
  const guides = existsSync(join(repositoryRoot, 'guides'))
    ? readdirSync(join(repositoryRoot, 'guides'))
        .filter((entry) => entry.endsWith('.md'))
        .map((entry) => join('guides', entry))
    : [];
  return [
    'README.md',
    'CONFIGURATION.md',
    ...guides,
    ...docsIn('packages'),
    ...docsIn('examples'),
  ];
}

// Returns { path, code, startLine } for each block, where `path` is null for
// fragments. `startLine` is the README line of the block's first code line, so
// a tsc error can be reported at the place a reader would look.
function extractBlocks(markdown) {
  const lines = markdown.split('\n');
  const blocks = [];
  let open = null;
  lines.forEach((line, index) => {
    if (open === null) {
      if (/^```(ts|typescript)\s*$/.test(line)) open = { startLine: index + 2, code: [] };
      return;
    }
    if (/^```\s*$/.test(line)) {
      const [first] = open.code;
      const declared = first ? first.match(/^\/\/\s*([A-Za-z0-9_@./-]+\.ts)\s*$/) : null;
      blocks.push({
        path: declared ? declared[1] : null,
        code: open.code.join('\n'),
        startLine: open.startLine,
      });
      open = null;
      return;
    }
    open.code.push(line);
  });
  return blocks;
}

function projectSlug(documentPath) {
  return documentPath.replace(/\/README\.md$/, '').replace(/[/.]/g, '-') || 'root';
}

function writeProject(documentPath, blocks) {
  const slug = projectSlug(documentPath);
  const projectRoot = join(workRoot, slug);
  rmSync(projectRoot, { recursive: true, force: true });
  const written = new Map();
  for (const block of blocks) {
    if (block.path === null) {
      fragments += 1;
      continue;
    }
    if (written.has(block.path)) {
      failures.push(
        `${documentPath}:${block.startLine}: two snippets declare ${block.path}; ` +
          'give the second file its own path',
      );
      continue;
    }
    const target = join(projectRoot, block.path);
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, `${block.code}\n`);
    written.set(block.path, block);
    compiledFiles += 1;
  }
  if (written.size === 0) return null;
  writeFileSync(
    join(projectRoot, 'tsconfig.json'),
    `${JSON.stringify(
      {
        compilerOptions: {
          strict: true,
          target: 'ES2022',
          module: 'nodenext',
          moduleResolution: 'nodenext',
          experimentalDecorators: true,
          emitDecoratorMetadata: true,
          esModuleInterop: true,
          skipLibCheck: true,
          noEmit: false,
          outDir: '.out',
          types: ['node'],
        },
        include: ['**/*.ts'],
        exclude: ['.out'],
      },
      null,
      2,
    )}\n`,
  );
  return { projectRoot, written };
}

function relative0(absolutePath) {
  return absolutePath.replace(`${repositoryRoot}/`, '');
}

// tsc reports `src/app.module.ts(12,5): error TS…`. Translate that back to the
// README coordinates so the failure names the document, not the scratch copy.
function reportTscOutput(documentPath, project, output) {
  for (const line of output.split('\n')) {
    const match = line.match(/^(.+?)\((\d+),(\d+)\):\s*(error .*)$/);
    if (match === null) {
      if (line.trim() !== '' && !line.startsWith('    ')) failures.push(`${documentPath}: ${line.trim()}`);
      continue;
    }
    const [, file, row, column, message] = match;
    const relative = file
      .replace(`${project.projectRoot}/`, '')
      .replace(`${relative0(project.projectRoot)}/`, '');
    const block = project.written.get(relative);
    const documentLine = block ? block.startLine + Number(row) - 1 : '?';
    failures.push(`${documentPath}:${documentLine} (${relative}:${row}:${column}) ${message}`);
  }
}


// A framework whose contract is enforced at boot cannot be verified by types
// alone: a resource with no request schema type-checks and then refuses to
// start. So every project that emits a Nest module is actually booted.
// A document that cannot boot in a sandbox (real credentials, a live
// provider) opts out with `<!-- docs-check: no-boot -->`.
const BOOT_RUNNER = `
const { readdirSync, statSync } = require('node:fs');
const { join } = require('node:path');
require('reflect-metadata');

function jsFiles(dir) {
  return readdirSync(dir).flatMap((entry) => {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) return jsFiles(full);
    return full.endsWith('.js') ? [full] : [];
  });
}

// A Nest entry point is either a class carrying @Module metadata or the
// DynamicModule object \createServer()\ returns.
function isModule(value) {
  if (typeof value === 'function') {
    return Reflect.getMetadata('imports', value) !== undefined;
  }
  return (
    typeof value === 'object' &&
    value !== null &&
    'module' in value &&
    typeof value.module === 'function'
  );
}


// GET routes with no path parameter — the collection endpoints a reader hits
// first. Express keeps them on the router stack; the shape moved between
// versions, hence the fallback.

function resolveSchema(schema, doc, seen) {
  if (!schema || typeof schema !== 'object') return schema;
  if (typeof schema.$ref === 'string') {
    const name = schema.$ref.split('/').pop();
    if (seen.has(name)) return {};
    seen.add(name);
    return resolveSchema((doc.components?.schemas ?? {})[name], doc, seen);
  }
  return schema;
}

// Smallest body the create schema accepts. A drift between the entity and
// the response schema only surfaces once a row exists, so the probe writes
// before it reads.
function sampleBody(schema, doc, seen) {
  const resolved = resolveSchema(schema, doc, seen ?? new Set());
  if (!resolved || typeof resolved !== 'object') return undefined;
  // The document's own example beats anything synthesised here — it is the
  // author's escape hatch for a pattern this sampler cannot satisfy.
  if (resolved.example !== undefined) return resolved.example;
  if (Array.isArray(resolved.examples) && resolved.examples.length > 0) {
    return resolved.examples[0];
  }
  if (Array.isArray(resolved.enum) && resolved.enum.length > 0) return resolved.enum[0];
  const type = Array.isArray(resolved.type) ? resolved.type[0] : resolved.type;
  if (type === 'string') {
    if (resolved.format === 'uuid') return '00000000-0000-4000-8000-000000000000';
    if (resolved.format === 'date-time') return new Date().toISOString();
    if (resolved.format === 'email') return 'probe@example.com';
    if (resolved.format === 'uri' || resolved.format === 'url') {
      return 'https://example.com';
    }
    const min = typeof resolved.minLength === 'number' ? resolved.minLength : 5;
    return 'probe'.padEnd(Math.max(min, 5), 'x');
  }
  if (type === 'integer' || type === 'number') return 1;
  if (type === 'boolean') return true;
  if (type === 'array') return [];
  const properties = resolved.properties ?? {};
  const required = resolved.required ?? Object.keys(properties).slice(0, 2);
  const body = {};
  for (const key of required) {
    if (properties[key] === undefined) continue;
    body[key] = sampleBody(properties[key], doc, new Set());
  }
  return body;
}

// Built straight from the running app, never through DI: resolving
// SwaggerUiService on an app that never registered it kills this process
// outright — no exception, no output, exit 1.
function openApiDocument(app) {
  try {
    const { DocumentBuilder, SwaggerModule } = require('@nestjs/swagger');
    return SwaggerModule.createDocument(app, new DocumentBuilder().build());
  } catch {
    return null;
  }
}

function collectionRoutes(app) {
  const instance = app.getHttpAdapter().getInstance();
  const stack = instance?.router?.stack ?? instance?._router?.stack ?? [];
  const paths = new Set();
  for (const layer of stack) {
    const route = layer.route;
    if (!route || !route.path || typeof route.path !== 'string') continue;
    if (route.path.includes(':')) continue;
    const methods = route.methods ?? {};
    if (methods.get === true) paths.add(route.path);
  }
  return [...paths];
}

function probeToken() {
  try {
    const { sign } = require('jsonwebtoken');
    return sign(
      { sub: 'docs-check-user', email: 'probe@example.com' },
      process.env.JWT_SECRET,
      { expiresIn: '5m' },
    );
  } catch {
    return null;
  }
}

async function probe(app, file) {
    // Booting proves DI. The first request proves the app answers: a
    // response schema that disagrees with the entity, or a missing
    // mount, is a 500 that init() never sees.
  const port = app.getHttpServer().address().port;
    const failures = [];
    const base = 'http://127.0.0.1:' + port;
    const doc = openApiDocument(app);
    // Only what the app documents. The router also carries the Swagger UI
    // assets, and counting a docs page as exercised behaviour is how a probe
    // flatters itself.
    const paths = new Set(
      Object.keys(doc?.paths ?? {}).filter((path) => !path.includes('{')),
    );
    let requests = 0;
    let exercised = 0;
    let guarded = 0;
    const rejectedWrites = [];
    const token = probeToken();

    const send = async (method, path, body, isCrudCollection = false) => {
      const headers = {};
      if (body !== undefined) headers['content-type'] = 'application/json';
      if (token !== null) headers.authorization = 'Bearer ' + token;
      const response = await fetch(base + path, {
        method,
        headers,
        body: body === undefined ? undefined : JSON.stringify(body),
      });
      requests += 1;
      const label = method + ' ' + path + ' -> ' + response.status;
      if (response.status >= 500) {
        failures.push(label);
      } else if (response.status === 401 || response.status === 403) {
        // A guard answered. Nothing past it was exercised, and saying
        // otherwise is how a probe becomes decoration.
        guarded += 1;
      } else if (response.status >= 400) {
        // A rejected body may be this sampler's fault rather than the
        // document's, so it is not called a defect. But on a generated CRUD
        // collection the write IS the proof: the read that follows sees an
        // empty table, and must not be counted as behaviour exercised.
        if (method === 'POST' && isCrudCollection) rejectedWrites.push(label);
      } else {
        exercised += 1;
      }
      return response;
    };

    const itemPathFor = (path) =>
      Object.keys(doc?.paths ?? {}).find(
        (candidate) =>
          candidate.startsWith(path + '/{') &&
          // One segment deeper, not two. The search starts past the prefix,
          // so the only possible match is "no further slash".
          candidate.indexOf('/', path.length + 1) === -1,
      );

    for (const path of paths) {
      const operations = doc?.paths?.[path] ?? {};
      const itemPath = itemPathFor(path);
      const isCrudCollection =
        itemPath !== undefined && operations.get !== undefined;
      const createSchema =
        operations.post?.requestBody?.content?.['application/json']?.schema;
      let createdId;
      let writeRejectedHere = false;
      if (createSchema !== undefined) {
        const rejectedBefore = rejectedWrites.length;
        const response = await send(
          'POST',
          path,
          sampleBody(createSchema, doc),
          isCrudCollection,
        );
        writeRejectedHere = rejectedWrites.length > rejectedBefore;
        if (response.status < 300) {
          const created = await response.json().catch(() => null);
          if (created && typeof created.id === 'string') createdId = created.id;
          else console.log('NOTE no string id returned by POST ' + path);
        }
      }
      if (operations.get !== undefined || createSchema === undefined) {
        const before = exercised;
        await send('GET', path);
        // Read after a write THIS collection rejected: an empty table proves
        // nothing, so the read does not count as behaviour exercised.
        if (writeRejectedHere && exercised > before) exercised = before;
      }
      if (createdId === undefined) continue;
      // The row just written is the only way to reach the item routes.
      if (itemPath === undefined) continue;
      const concrete = itemPath.replace(/\{[^}]+\}/, createdId);
      const item = doc.paths[itemPath];
      if (item.get !== undefined) await send('GET', concrete);
      const updateSchema =
        item.patch?.requestBody?.content?.['application/json']?.schema;
      if (updateSchema !== undefined) {
        await send('PATCH', concrete, sampleBody(updateSchema, doc));
      }
      // A sub-resource collection only exists under a real parent id, so it
      // is reachable only now: /pets/{petId}/tags with the row just created.
      const nestedPaths = Object.keys(doc?.paths ?? {}).filter((candidate) => {
        if (!candidate.startsWith(path + '/{')) return false;
        const rest = candidate.slice(path.length + 1).split('/');
        return (
          rest.length === 2 && rest[0].startsWith('{') && !rest[1].includes('{')
        );
      });
      for (const nested of nestedPaths) {
        const nestedOps = doc.paths[nested];
        const nestedPath = nested.replace(/\{[^}]+\}/, createdId);
        const nestedCreate =
          nestedOps.post?.requestBody?.content?.['application/json']?.schema;
        const nestedIsCollection =
          nestedOps.get !== undefined && nestedCreate !== undefined;
        if (nestedCreate !== undefined) {
          await send(
            'POST',
            nestedPath,
            sampleBody(nestedCreate, doc),
            nestedIsCollection,
          );
        }
        if (nestedOps.get !== undefined) await send('GET', nestedPath);
      }

      if (item.delete !== undefined) await send('DELETE', concrete);
    }
    await app.close();
    if (failures.length > 0) {
      console.error('5xx on ' + failures.join(', '));
      process.exitCode = 1;
      setImmediate(() => process.exit(1));
      return;
    }
    console.log(
      'BOOTED ' + file + ' (requests ' + requests + ', exercised ' +
        exercised + ', guarded ' + guarded + ', rejected writes ' +
        rejectedWrites.length + ')',
    );
    // undici keeps pooled sockets open, so a clean close is not enough to
    // let the process end on its own. Setting exitCode and unref-ing beats
    // process.exit(), which truncates output still queued on a pipe.
    process.exitCode = 0;
    setImmediate(() => process.exit(0));

}

async function main() {
  const { NestFactory } = require('@nestjs/core');
  process.env.PORT = '0';
  // Environment comes from the document, never from here. Inventing a value
  // the README never mentions makes the probe reproduce something no reader
  // can: it passes routes that answer 401 to everyone else.
  for (const [key, value] of Object.entries(JSON.parse(process.argv[3] ?? '{}'))) {
    process.env[key] = value;
  }
  const all = jsFiles(process.argv[2]);
  // Prefer the documented entry point: what main.ts does (seeding, mounting
  // Swagger) is invisible to a module booted directly, and that gap is
  // exactly where a broken bootstrap hides. It must export bootstrap and
  // honour PORT; PORT=0 keeps the probe off a fixed port.
  const mainFile = all.find((file) => file.endsWith('main.js'));
  if (mainFile !== undefined) {
    process.env.PORT = '0';
    const loaded = require(mainFile);
    if (typeof loaded.bootstrap === 'function') {
      const app = await loaded.bootstrap();
      await probe(app, mainFile);
      return;
    }
  }
  const files = all.filter((file) => !file.endsWith('main.js'));
  // The entry point is the module nothing else imports; app.module / server
  // are the conventional names, so prefer them and fall back to any module.
  const ranked = files.sort((a, b) => score(b) - score(a));
  for (const file of ranked) {
    const loaded = require(file);
    for (const value of Object.values(loaded)) {
      if (!isModule(value)) continue;
      const app = await NestFactory.create(value, { logger: false });
      await app.init();
      await app.listen(0);
      await probe(app, file);
      return;
    }
  }
  console.log('NO MODULE');
  process.exit(0);
}

function score(file) {
  if (file.endsWith('app.module.js')) return 2;
  if (file.endsWith('server.js')) return 1;
  return 0;
}

main().catch((error) => {
  console.error(String((error && error.stack) || error));
  process.exitCode = 1;
  setImmediate(() => process.exit(1));
});
`;


// `KEY=value` as the document's own run step writes it — and only there.
// A comment, a "don't do this" block or a pasted output line is not an
// instruction, and taking a value from one lets the probe run a
// configuration no reader was told to use.
const RUN_COMMAND = /\b(yarn|npm|pnpm|npx|node|nest|docker)\b/;

function documentedEnv(markdown, documentPath) {
  const env = {};
  for (const block of markdown.matchAll(/```(?:bash|sh|shell)\n([\s\S]*?)```/g)) {
    for (const rawLine of block[1].split('\n')) {
      const line = rawLine.trim();
      if (line === '' || line.startsWith('#')) continue;
      if (!RUN_COMMAND.test(line)) continue;
      const assignments = line.matchAll(
        /(?:^|\s)(?:export\s+)?([A-Z][A-Z0-9_]{2,})=("[^"]*"|'[^']*'|[^\s]*)/g,
      );
      for (const [, key, rawValue] of assignments) {
        const value = rawValue.replace(/^["']|["']$/g, '');
        // A value the gate cannot evaluate must be reported, not guessed:
        // booting without it blames the application for a parser gap.
        if (value.includes('$(') || value.includes('${')) {
          failures.push(
            `${documentPath}: the run step sets ${key} from a shell ` +
              'substitution this gate cannot evaluate — give the example a ' +
              'literal value, or the probe runs without it',
          );
          continue;
        }
        env[key] = value;
      }
    }
  }
  return env;
}

function bootProject(documentPath, project, markdown) {
  // The marker carries its reason inline: `<!-- docs-check: no-boot — why -->`.
  // A bare marker is refused: an opt-out without a stated reason is how a
  // real breakage gets parked.
  const optOut = markdown.match(/<!--\s*docs-check:\s*no-boot\b([^>]*)-->/);
  if (optOut !== null) {
    if (optOut[1].replace(/[—\s-]/g, '') === '') {
      failures.push(
        `${documentPath}: the no-boot opt-out must state its reason`,
      );
    }
    return;
  }
  const outDir = join(project.projectRoot, '.out');
  if (!existsSync(outDir)) return;
  const runner = join(project.projectRoot, 'boot-runner.cjs');
  writeFileSync(runner, BOOT_RUNNER);
  try {
    const output = execFileSync(process.execPath, [runner, outDir, JSON.stringify(documentedEnv(markdown, documentPath))], {
      cwd: repositoryRoot,
      encoding: 'utf8',
      timeout: 120000,
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    const counts = output.match(
      /requests (\d+), exercised (\d+), guarded (\d+), rejected writes (\d+)/,
    );
    if (counts !== null) {
      sentRequests += Number(counts[1]);
      exercisedRequests += Number(counts[2]);
      rejectedWrites += Number(counts[4]);
      // A document whose every probe stopped at a guard proves DI and
      // nothing else; the headline must not read as if it proved behaviour.
      const sent = Number(counts[1]);
      const reached = Number(counts[2]);
      if (sent === 0) {
        routelessDocuments.push(documentPath);
      } else if (reached === 0) {
        failures.push(
          `${documentPath}: the example serves ${sent} documented routes and ` +
            'not one of them was exercised — the examples prove nothing',
        );
      }
    }
    if (output.includes('NO MODULE')) {
      if (mustCompileSomething(documentPath)) {
        failures.push(
          `${documentPath}: the examples never reach a Nest module, so ` +
            'nothing here is proven to start',
        );
      }
      return;
    }
    bootedProjects += 1;
    bootedDocuments.push(documentPath);
  } catch (error) {
    const raw = `${error.stderr ?? ''}${error.stdout ?? ''}`.trim();
    const message =
      raw === ''
        ? `the boot produced no output and ended as ` +
          `${error.signal ?? error.code ?? `status ${error.status}`}`
        : raw.split('\n').slice(0, 4).join(' | ');
    failures.push(`${documentPath}: the example does not boot — ${message}`);
  }
}


// A package README must teach at least one runnable path; a deep reference
// document (CONFIGURATION.md) or an example app's README may be all prose.
function mustCompileSomething(documentPath) {
  // A guide teaches a path and must carry it as real files. The guides
  // index is a map of the others, so it is exempt.
  if (documentPath === 'guides/README.md') return false;
  return (
    documentPath === 'README.md' ||
    documentPath.startsWith('guides/') ||
    /^packages\/[^/]+\/README\.md$/.test(documentPath)
  );
}

// An install command a reader cannot follow is the same defect as a missing
// file: the snippet imports a package the document never told them to add.
const IMPORT_PATTERN = /(?:from|require\()\s*'([^'.][^']*)'/g;
function packageOf(specifier) {
  if (specifier.startsWith('node:')) return null;
  const parts = specifier.split('/');
  return specifier.startsWith('@') ? parts.slice(0, 2).join('/') : parts[0];
}

function checkInstallCoverage(documentPath, markdown, project) {
  const installText = [...markdown.matchAll(/```(?:bash|sh|shell)\n([\s\S]*?)```/g)]
    .map((match) => match[1])
    .filter((block) => /\b(yarn add|npm i(nstall)?|pnpm add)\b/.test(block))
    .join('\n');
  if (installText === '') return;
  // Token-exact: `@nestjs/typeorm` must not satisfy an import of `typeorm`,
  // and `@concepta/rockets-core` must not satisfy `@concepta/rockets`.
  const installed = new Set(
    installText
      .split(/\s+/)
      .filter((token) => token !== '' && !token.startsWith('-') && token !== '\\')
      .map((token) => token.replace(/@(alpha|beta|latest|next|\d[^@]*)$/, '')),
  );
  const missing = new Set();
  for (const block of project.written.values()) {
    for (const [, specifier] of block.code.matchAll(IMPORT_PATTERN)) {
      const name = packageOf(specifier);
      if (name === null) continue;
      if (!installed.has(name)) missing.add(name);
    }
  }
  for (const name of [...missing].sort()) {
    failures.push(
      `${documentPath}: the examples import \`${name}\`, which no install ` +
        'command in this document adds',
    );
  }
}

function checkDocument(documentPath) {
  const markdown = readFileSync(join(repositoryRoot, documentPath), 'utf8');
  const project = writeProject(documentPath, extractBlocks(markdown));
  if (project === null) {
    if (mustCompileSomething(documentPath)) {
      failures.push(
        `${documentPath}: no compiled example — a package README must carry ` +
          'at least one complete file (first line `// src/<path>.ts`)',
      );
    }
    return;
  }
  checkInstallCoverage(documentPath, markdown, project);
  try {
    execFileSync(tsc, ['--pretty', 'false', '-p', project.projectRoot], {
      cwd: repositoryRoot,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    bootProject(documentPath, project, markdown);
  } catch (error) {
    reportTscOutput(documentPath, project, `${error.stdout ?? ''}${error.stderr ?? ''}`);
  }
}

if (!existsSync(tsc)) {
  console.error('TypeScript is not installed; run `yarn install` first.');
  process.exit(1);
}

mkdirSync(workRoot, { recursive: true });
for (const documentPath of documentPaths()) checkDocument(documentPath);

if (failures.length > 0) {
  console.error('Documentation snippets failed to compile:\n');
  for (const failure of failures) console.error(`  ${failure}`);
  console.error(
    `\n${compiledFiles} snippet files compiled, ${fragments} fragments skipped, ` +
      `${failures.length} failures.`,
  );
  process.exit(1);
}

console.log(
  `Documentation snippets compile: ${compiledFiles} files across ` +
    `${documentPaths().length} documents (${fragments} fragments skipped); ` +
    `${bootedProjects} examples booted a real Nest application; ` +
    `${sentRequests} requests sent, ${exercisedRequests} reached a handler, ` +
    `${rejectedWrites} writes the app rejected.`,
);
if (bootedDocuments.length > 0) {
  console.log(`Booted: ${bootedDocuments.join(', ')}`);
}
if (routelessDocuments.length > 0) {
  console.log(
    `No HTTP surface to exercise (expected for these): ` +
      `${routelessDocuments.join(', ')}`,
  );
}

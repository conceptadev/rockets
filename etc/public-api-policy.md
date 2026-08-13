# Public API Policy

The `exports` maps in the six publishable package manifests define the only
supported import paths. Deep paths under `src/` or `dist/` are internal unless
a manifest exposes them explicitly.

## Curated package roles

- `@concepta/rockets-core` owns the complete composition and infrastructure
  contract, including its `/zod` entry point.
- `@concepta/rockets` is an external-auth composition package with a curated,
  application-facing core facade. It does not promise to re-export every core
  name. Its README records the advanced seams that remain core-only.
- `@concepta/rockets-auth` is a sibling built-in identity bundle. It exports
  auth domains and selected integration conveniences; it does not mirror the
  server facade.
- Repository adapters and the Firebase adapter expose only their manifest
  entry points. A package may intentionally re-export an upstream library, as
  the TypeORM adapter does, but that commitment is still captured by the API
  report.

## Compatibility decisions

- `RocketsAuthUserMetadataCreateDtoInterface` stays as a legacy alias for
  `RocketsAuthUserMetadataCreatableInterface` during the pre-1.0 namespace
  migration. New code uses the canonical name. Removing the alias requires an
  explicit migration note.
- Source-only re-export shims are not public subpaths. Keep one when live
  repository code or fixtures use it as an intentional internal boundary;
  delete it when it has no supported or internal consumer. Pre-1.0 status by
  itself is not a reason to remove a shim.
- Runtime helpers have one implementation owner. Core owns the error-logging
  helpers; server and auth preserve their root export names by re-exporting
  core's declarations and runtime values.

## Declaration reports

[`public-api-reports.json`](public-api-reports.json) is generated from a fresh
build with the repository's pinned TypeScript compiler. It records every
exported name and declaration signature for all eight TypeScript entry points:
the six package roots and the two `/zod` subpaths.

Run:

```bash
yarn build
yarn api:report
```

CI rejects an unreviewed name or signature change. For an intentional public
change:

1. Review the consumer and compatibility impact.
2. Update the relevant README and add a migration note when consumers must
   change code.
3. Run `yarn api:report:update` after the build.
4. Review the JSON diff as part of the change; generation alone is not
   approval.

Do not replace a curated export list with `export *` merely to equalize package
counts. Adding a name is a compatibility commitment just as removing or
changing one is a compatibility event.

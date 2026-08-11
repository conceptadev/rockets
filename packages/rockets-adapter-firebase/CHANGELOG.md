# Changelog

## Unreleased

### Release preparation

- Package manifest set to `1.0.0-alpha.8`; registry publication is
  pending.

### Changed

- Synchronous `defineFirebaseAuth()` options are now flat
  (`defineFirebaseAuth({ firebaseApp })`); asynchronous wiring remains the
  explicit `{ forRootAsync }` variant.
- Node.js 20 is the minimum supported runtime.

## 1.0.0-alpha.0

- Initial public alpha release of the Firebase auth adapter.

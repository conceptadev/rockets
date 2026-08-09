// Re-exported rather than reimplemented: upstream's decorator writes the same
// metadata key `AuthServerGuard` reads (`ROCKETS_DISABLE_GUARDS_TOKEN` mirrors
// `AUTHENTICATION_MODULE_DISABLE_GUARDS_TOKEN`, which upstream does not export),
// and the `true` / `'classLevel'` sentinel must match the upstream guard's
// exactly. Owning a copy here only creates a way for the two to drift.
// Consumers keep single-sourcing from `@concepta/rockets-core`.
export {
  AuthPublic,
  type AuthPublicMetadata,
  type AuthPublicOptions,
} from '@concepta/nestjs-authentication';

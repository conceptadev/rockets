import type { PlainLiteralObject } from '@nestjs/common';

/**
 * Minimal repository-context shape consumed by upstream CQRS commands
 * (`UpdateUserCommand`, `RemoveUserCommand`, `CrudListQuery`, …) as their
 * first argument.
 *
 * Structurally equivalent to the upstream `RepositoryContextInterface`
 * declared in `@concepta/nestjs-repository`. The public barrel exports only
 * `RepoCtx`, so keeping this small shape local avoids a deep import.
 */
export interface RepositoryContextInterface extends PlainLiteralObject {
  entity: string;
}

/**
 * Builds a minimal `RepositoryContextInterface` for CQRS delegation.
 * Used by every Rockets handler that delegates to upstream Concepta
 * commands/queries which require a context as their first argument.
 */
export function createRepositoryContext(
  entityKey: string,
): RepositoryContextInterface {
  return { entity: entityKey };
}

import type { RepositoryProviderOptions } from '@concepta/nestjs-repository';
import type { PlainLiteralObject } from '@nestjs/common';

export interface FirestoreProviderOptions<
  Entity extends PlainLiteralObject = PlainLiteralObject,
> extends RepositoryProviderOptions<Entity> {
  /** Firestore collection id (defaults to entity registration key). */
  readonly collection?: string;
  /**
   * Soft-delete column (auto-detected when the entity has `dateRemoved` or
   * `deletedAt`; set explicitly when the class shape is not detectable).
   */
  readonly softDeleteField?: string;
  /**
   * Tier-1 uniqueness: derive the document id from this field on create when
   * `id` is omitted. Composite unique constraints are not supported yet —
   * declare them and the factory throws at boot.
   */
  readonly uniqueDocumentIdField?: string;
  /**
   * Declared unique constraints (from schema / registration). Composite
   * entries (length \> 1) refuse at boot until the uniqueness-index collection
   * lands (issue #44 P1-3 tier 2).
   */
  readonly uniqueConstraints?: ReadonlyArray<ReadonlyArray<string>>;
}

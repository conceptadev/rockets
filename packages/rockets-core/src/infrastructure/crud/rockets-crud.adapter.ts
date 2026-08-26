import type { PlainLiteralObject } from '@nestjs/common';
import { isObject } from '@nestjs/common/utils/shared.utils';
import type { DeepPartial } from '@concepta/nestjs-core';
import { CrudAdapter, type CrudContextInterface } from '@concepta/nestjs-crud';

/**
 * The CRUD adapter every generated resource runs on.
 *
 * Upstream's `prepareEntityBeforeSave` answers a create payload that
 * validates to zero keys with a bare `400 Bad Request`. That check
 * predates schema validation: by the time the adapter sees the body it
 * has already passed the operation's input schema, so an empty object is
 * a valid create whenever the schema accepts it. A sub-resource whose
 * every column is server-stamped (`PathScopeHook`, `OwnerStampHook`, a
 * consumer hook minting ids and timestamps) is the common case — the
 * client posts `{}` and the hooks fill the row.
 *
 * The schema is the contract. This adapter keeps upstream's params merge
 * and drops only the empty-payload rejection; a non-object payload still
 * returns `undefined` (upstream answers `400`). The repository's
 * `prepare()` refuses an empty object for the same historical reason, so
 * that case builds the bare entity instance `prepare()` would otherwise
 * have returned (`Object.assign(new Entity(), {})`).
 */
export class RocketsCrudAdapter<
  Entity extends PlainLiteralObject,
> extends CrudAdapter<Entity> {
  override prepareEntityBeforeSave(
    dto: DeepPartial<Entity>,
    context: CrudContextInterface<Entity>,
  ): Entity | undefined {
    if (!isObject(dto)) {
      return undefined;
    }
    let merged: DeepPartial<Entity> = dto;
    for (const [field, value] of Object.entries(context.params)) {
      if (field in merged) {
        merged = { ...merged, [field]: value };
      }
    }
    return this.repository.prepare(merged) ?? new (this.entityType())();
  }
}

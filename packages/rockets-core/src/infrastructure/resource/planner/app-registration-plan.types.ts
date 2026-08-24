import type { DynamicModule, PlainLiteralObject, Type } from '@nestjs/common';
import type { CanAccess } from '@concepta/nestjs-access-control';
import type { RepositoryPersistenceConfig } from '../../../domain/interfaces/repository-persistence.interface';
import type { RocketsResourceConfig } from '../../../domain/interfaces/rockets-resource.interface';
import type { CrudResource } from '../../../domain/interfaces/rockets-resource-bundle.interface';
import type { ModuleResource } from '../../../domain/interfaces/module-resource.interface';
import type { OperationResource } from '../../../domain/interfaces/operation-resource.interface';
import { ResourceKind } from '../../../domain/interfaces/resource-kind.enum';

export interface AppRegistrationPlan {
  readonly crudResources: ReadonlyArray<RocketsResourceConfig>;
  readonly entityRegistrations: ReadonlyArray<RepositoryPersistenceConfig>;
  readonly nestModules: ReadonlyArray<DynamicModule>;
  /**
   * `CanAccess` classes collected from every bundle's `acl`, merged into
   * `AccessControlModule.forRoot({ queryServices })` so apps do not have
   * to remember the registration separately from the declaration.
   */
  readonly accessControlQueryServices: ReadonlyArray<Type<CanAccess>>;
}

export type ResourceInput<E extends PlainLiteralObject = PlainLiteralObject> =
  | CrudResource<E>
  | ModuleResource
  | OperationResource
  | RocketsResourceConfig;

export function isCrudResource(value: unknown): value is CrudResource {
  return (
    typeof value === 'object' &&
    value !== null &&
    'kind' in value &&
    value.kind === ResourceKind.Crud
  );
}

export interface SortedResourceInputs {
  readonly generatedResources: ReadonlyArray<CrudResource>;
  readonly moduleBundles: ReadonlyArray<ModuleResource>;
  readonly operationBundles: ReadonlyArray<OperationResource>;
  readonly manualResources: ReadonlyArray<RocketsResourceConfig>;
}

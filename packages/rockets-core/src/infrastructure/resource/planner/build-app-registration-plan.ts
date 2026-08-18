import type { RepositoryModuleInterface } from '@concepta/nestjs-repository';
import type { RocketsResourceConfig } from '../../../domain/interfaces/rockets-resource.interface';
import type { RocketsUserMetadataConfig } from '../../../domain/interfaces/rockets-user-metadata-config.interface';
import { validateRocketsUserMetadataConfig } from '../../user-metadata/validate-rockets-user-metadata-config';
import {
  type AppRegistrationPlan,
  type ResourceInput,
} from './app-registration-plan.types';
import { buildEntityRegistry } from './entity-registry';
import { buildRepositoryPlan } from './repository-plan';
import { sortResourceInputs } from './sort-resource-inputs';
import { materialiseModuleResource } from './materialise-module-resource';
import { materialiseOperationResource } from './materialise-operation-resource';
import { validateResourceRelations } from './validate-relations';
import { validateStructuredRouteCollisions } from './validate-route-collisions';
import { planAccessControl } from './validate-access-control';

/**
 * Plan everything a `RocketsCoreModule` boot needs from the user's
 * mixed `resources: [...]` array, the default `repository` adapter, and
 * the optional `userMetadata` config.
 *
 * Pipeline:
 *   1. Sort inputs (CRUD / module-resource / operation-resource / manual).
 *   2. Build entity registry (dedupe + relation targets).
 *   3. Group repository rows per adapter (strict — adapter required).
 *   4. Validate CRUD relations against the registry.
 *   5. Reject cross-resource METHOD+path collisions (CRUD/Sub/Operation).
 *   6. Materialise module-resource and operation-resource Nest slices.
 */
export function buildAppRegistrationPlan(args: {
  readonly resources: ReadonlyArray<ResourceInput>;
  readonly repository?: RepositoryModuleInterface;
  readonly userMetadata?: RocketsUserMetadataConfig;
  /** Whether the app configured root `accessControl`. */
  readonly accessControl?: boolean;
  /** Whether every authenticated route must carry an ACL grant. */
  readonly enforceGrants?: boolean;
}): AppRegistrationPlan {
  if (args.userMetadata) {
    validateRocketsUserMetadataConfig(args.userMetadata);
  }

  const {
    generatedResources,
    moduleBundles,
    operationBundles,
    manualResources,
  } = sortResourceInputs(args.resources);

  const entityRegistry = buildEntityRegistry(
    generatedResources,
    moduleBundles,
    args.userMetadata,
  );

  const entityRegistrations = buildRepositoryPlan({
    generatedResources,
    moduleBundles,
    userMetadata: args.userMetadata,
    rootAdapter: args.repository,
  });

  validateResourceRelations(generatedResources, entityRegistry);

  validateStructuredRouteCollisions({
    generatedResources,
    manualResources,
    operationBundles,
  });

  const nestModules = [
    ...moduleBundles.map(materialiseModuleResource),
    ...operationBundles.map(materialiseOperationResource),
  ];

  const crudResources: RocketsResourceConfig[] = [
    ...generatedResources.map((resource) => resource.core),
    ...manualResources,
  ];

  const accessControlQueryServices = planAccessControl({
    plans: [
      ...generatedResources.map((resource) => resource.acl),
      ...operationBundles.map((bundle) => bundle.acl),
    ],
    configured: args.accessControl === true,
    enforceGrants: args.enforceGrants === true,
  });

  return {
    crudResources,
    entityRegistrations,
    nestModules,
    accessControlQueryServices,
  };
}

import type { RocketsResourceConfig } from '../../../domain/interfaces/rockets-resource.interface';
import type { CrudResource } from '../../../domain/interfaces/rockets-resource-bundle.interface';
import type { ModuleResource } from '../../../domain/interfaces/module-resource.interface';
import type { OperationResource } from '../../../domain/interfaces/operation-resource.interface';
import { isModuleResource } from '../define-module-resource';
import { isOperationResource } from '../define-operation-resource';
import {
  isCrudResource,
  type ResourceInput,
  type SortedResourceInputs,
} from './app-registration-plan.types';

export function sortResourceInputs(
  resources: ReadonlyArray<ResourceInput>,
): SortedResourceInputs {
  const generatedResources: CrudResource[] = [];
  const moduleBundles: ModuleResource[] = [];
  const operationBundles: OperationResource[] = [];
  const manualResources: RocketsResourceConfig[] = [];

  const collectGenerated = (bundle: CrudResource): void => {
    generatedResources.push(bundle);
    for (const sub of bundle.subResources ?? []) {
      collectGenerated(sub);
    }
  };

  for (const definition of resources) {
    if (isCrudResource(definition)) {
      collectGenerated(definition);
    } else if (isModuleResource(definition)) {
      moduleBundles.push(definition);
    } else if (isOperationResource(definition)) {
      operationBundles.push(definition);
    } else {
      manualResources.push(definition);
    }
  }

  return {
    generatedResources,
    moduleBundles,
    operationBundles,
    manualResources,
  };
}

import type { CrudResource } from '../../../domain/interfaces/rockets-resource-bundle.interface';
import { getEntityHookBinding } from '../../hooks/entity-hook';
import type { EntityRegistry } from './entity-registry';

/**
 * Reject, at BOOT, an entity hook whose spec can never match the key its
 * entity is actually registered under.
 *
 * ## The failure this exists to prevent
 *
 * `@EntityHook({ entity })` bakes `deriveEntityKey(entity)` into an
 * `EntitySpecification`, and the upstream repository adapter stamps the
 * REGISTRATION key — `defineResource({ key })`, which defaults to the
 * derived key but need not equal it — onto the hook context. Matching is
 * a raw string compare. So:
 *
 * ```ts
 * defineResource({ entity: PetEntity, key: 'pets', path: 'pets',
 *   hooks: [TenantScopeHook.for(PetEntity, { … })] });
 * ```
 *
 * registers the entity as `'pets'` while the hook matches `'pet'`. The
 * hook never fires. Nothing throws, nothing warns, the app boots clean,
 * and every test that only exercises the happy path still passes — for a
 * row-scoping hook that is a silent, total fail-OPEN: every tenant sees
 * every other tenant's rows.
 *
 * Sibling hook helpers (`defineHook`, `AfterCreateReloadHook`) derive the
 * same key for an `@InjectDynamicRepository(...)` token, so THEY already
 * fail loudly at boot on an unresolvable provider. Scoping hooks have no
 * such dependency, which is exactly why they need this check.
 *
 * ## Scope
 *
 * Hooks declared on generated CRUD bundles — resource-level `hooks`,
 * per-operation `operations[op].hooks`, and the composed hooks of
 * recursively-flattened sub-resources (see `CrudResource.meta.hooks`).
 * **Not** checked: hooks registered as bare providers on a
 * `defineModuleResource({ module: { providers } })` slice, or applied by a
 * hand-written `@UseHooks` on a consumer-owned controller — the planner
 * never sees those, so a clean boot says nothing about them.
 *
 * A hook decorated `@EntityHook()` with no `entity` is deliberately
 * unbound (the documented multi-entity case) and carries no binding, so
 * it is skipped rather than reported.
 */
export function validateEntityHookBindings(
  generatedResources: ReadonlyArray<CrudResource>,
  entityRegistry: EntityRegistry,
): void {
  for (const resource of generatedResources) {
    for (const hook of resource.meta.hooks) {
      const binding = getEntityHookBinding(hook);
      if (!binding) continue;

      const registeredKey = entityRegistry.get(binding.entity);

      if (registeredKey === undefined) {
        throw new Error(
          `buildAppRegistrationPlan[${resource.meta.key}]: hook \`${hook.name}\` is bound to ` +
            `entity \`${binding.entity.name}\`, which is not registered in this RocketsModule. ` +
            `The hook would never fire — for a scoping hook that means every row is visible. ` +
            `Either declare a \`defineResource()\` resource for \`${binding.entity.name}\`, add ` +
            `it to a \`defineModuleResource({ entities: [...] })\` bundle, or drop the hook.`,
        );
      }

      if (registeredKey !== binding.entityKey) {
        throw new Error(
          `buildAppRegistrationPlan[${resource.meta.key}]: hook \`${hook.name}\` matches entity ` +
            `key "${binding.entityKey}", but \`${binding.entity.name}\` is registered under ` +
            `"${registeredKey}". Entity-hook matching is an exact string compare, so this hook ` +
            `would never fire — for a scoping hook that is a silent fail-open, not a no-op. ` +
            `Either register the entity under "${binding.entityKey}" (drop the explicit \`key\`, ` +
            `or set \`key: '${binding.entityKey}'\`), or bind the hook to the key in use ` +
            `(\`entityKey: '${registeredKey}'\` in the hook's options).`,
        );
      }
    }
  }
}

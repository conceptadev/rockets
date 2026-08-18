import type { Type } from '@nestjs/common';
import type { CanAccess } from '@concepta/nestjs-access-control';
import type { ResourceAclPlan } from '../../../domain/interfaces/resource-acl.interface';

export interface AccessControlPlanInput {
  /** ACL summaries from every CRUD and operation bundle. */
  readonly plans: ReadonlyArray<ResourceAclPlan>;
  /** Whether the app configured root `accessControl`. */
  readonly configured: boolean;
  /**
   * Whether every authenticated route must carry a grant. Off by default:
   * turning it on is the secure-by-default switch, and turning it on for
   * an app that guards its routes with hand-written `AccessControl*`
   * decorators would reject a working configuration — core cannot
   * introspect an opaque decorator list without applying it twice.
   */
  readonly enforceGrants: boolean;
}

/**
 * Boot-time access-control validation, plus the `CanAccess` services to
 * hand `AccessControlModule.forRoot`.
 *
 * The failure this exists to prevent: an operation reaches production
 * authenticated but ungranted. Upstream's check-access handler returns
 * `true` for any route with no grant metadata
 * (`check-access.handler.js`), so a forgotten decorator is an open route
 * that no test notices.
 */
export function planAccessControl(
  input: AccessControlPlanInput,
): ReadonlyArray<Type<CanAccess>> {
  const { plans, configured, enforceGrants } = input;

  const declaring = plans.filter((plan) => plan.declared);
  if (declaring.length > 0 && !configured) {
    throw new Error(
      `buildAppRegistrationPlan: ${declaring
        .map((plan) => plan.label)
        .join(', ')} declared \`acl\` but the app configured no root ` +
        '`accessControl`. Add it to `RocketsCoreModule.forRoot({ accessControl })` ' +
        'or drop the resource-level `acl`.',
    );
  }

  if (enforceGrants) {
    if (!configured) {
      throw new Error(
        'buildAppRegistrationPlan: `accessControl.enforceGrants` requires ' +
          'root `accessControl` to be configured.',
      );
    }
    const offenders = plans.filter(
      (plan) => plan.ungrantedOperations.length > 0,
    );
    if (offenders.length > 0) {
      const detail = offenders
        .map((plan) => `${plan.label}: ${plan.ungrantedOperations.join(', ')}`)
        .join('; ');
      throw new Error(
        'buildAppRegistrationPlan: `accessControl.enforceGrants` is on and ' +
          `these authenticated operations carry no grant — ${detail}. ` +
          'Declare `acl` on the resource, or `acl: false` on the operation ' +
          'to record that it is deliberately ungranted.',
      );
    }
  }

  return [...new Set(plans.flatMap((plan) => [...plan.queryServices]))];
}

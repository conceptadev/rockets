import {
  AccessControlGrant,
  AccessControlQuery,
} from '@concepta/nestjs-access-control';

/**
 * The metadata keys upstream's ACL decorators write under.
 *
 * Nest's `SetMetadata` attaches the key it writes to as `KEY` on the
 * decorator it returns, and both upstream decorators are bare
 * `SetMetadata` calls — so `AccessControlGrant().KEY` IS the key, typed,
 * public, and drift-proof. An earlier revision derived the keys by
 * applying the decorators to a throwaway class and diffing
 * `Reflect.getMetadataKeys`; 75 lines doing what one property read does.
 *
 * Resolved lazily and asserted loudly. Lazily, because this module is
 * reachable from the package's main barrel and a module-load throw would
 * break every consumer, including apps that never declared a policy.
 * Loudly, because the failure direction of a missing key is the one this
 * audit exists to remove: `readGrantField` would return `null` for every
 * route, `aclAction` would always be empty, and a policy declaring only
 * `requireAclQuery` would boot green while checking nothing.
 */
export function aclMetadataKeys(): { grant: string; query: string } {
  const grant: unknown = AccessControlGrant().KEY;
  const query: unknown = AccessControlQuery().KEY;

  if (typeof grant !== 'string' || typeof query !== 'string') {
    throw new Error(
      'RouteAuditService: could not resolve the ACL metadata keys from ' +
        '@concepta/nestjs-access-control — AccessControlGrant().KEY / ' +
        'AccessControlQuery().KEY did not return strings. The upstream ' +
        'decorator contract changed; the audit cannot read grants and ' +
        'refuses to report every route as ungranted-by-default.',
    );
  }

  return { grant, query };
}

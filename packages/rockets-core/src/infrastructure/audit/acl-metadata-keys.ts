import {
  AccessControlGrant,
  AccessControlQuery,
} from '@concepta/nestjs-access-control';

/**
 * The metadata keys upstream's ACL decorators write under.
 *
 * Derived by applying each decorator to a throwaway class and reading
 * back which key changed, rather than copying
 * `ACCESS_CONTROL_MODULE_GRANT_METADATA` — those constants exist but are
 * not in the package's export map, and a hardcoded copy would drift
 * silently on an upstream rename. The audit would then report every
 * route as ungranted, which is a lie in exactly the direction this
 * module exists to prevent.
 *
 * Resolved once at module load; the decorators are pure `SetMetadata`
 * calls, so probing is free and has no side effects beyond the probe.
 */
function probeKey(
  decorate: (target: NewableFunction) => void,
  matches: (value: unknown) => boolean,
): string | undefined {
  class Probe {}
  decorate(Probe);

  for (const key of Reflect.getMetadataKeys(Probe)) {
    if (typeof key !== 'string') continue;
    if (matches(Reflect.getMetadata(key, Probe))) return key;
  }
  return undefined;
}

const GRANT_SENTINEL = '__rockets_audit_probe_grant__';

export const ACL_GRANT_METADATA_KEY = probeKey(
  (target) => {
    // The decorator's own typing expects real grant objects; the probe
    // only needs a value it can recognise coming back out.
    const grant = { action: GRANT_SENTINEL } as unknown as Parameters<
      typeof AccessControlGrant
    >[0];
    AccessControlGrant(grant)(target);
  },
  (value) =>
    Array.isArray(value) &&
    value.some(
      (entry) =>
        typeof entry === 'object' &&
        entry !== null &&
        Reflect.get(entry, 'action') === GRANT_SENTINEL,
    ),
);

class QueryProbeService {}

export const ACL_QUERY_METADATA_KEY = probeKey(
  (target) => {
    const query = {
      service: QueryProbeService,
    } as unknown as Parameters<typeof AccessControlQuery>[0];
    AccessControlQuery(query)(target);
  },
  (value) => containsQueryProbe(value),
);

function containsQueryProbe(value: unknown): boolean {
  const entries = Array.isArray(value) ? value : [value];
  return entries.some(
    (entry) =>
      typeof entry === 'object' &&
      entry !== null &&
      Reflect.get(entry, 'service') === QueryProbeService,
  );
}

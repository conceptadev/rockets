import { describe, expect, it } from 'vitest';
import {
  AccessControlGrant,
  AccessControlQuery,
  type CanAccess,
} from '@concepta/nestjs-access-control';
import { ActionEnum } from '@concepta/nestjs-core';

import {
  ACL_GRANT_METADATA_KEY,
  ACL_QUERY_METADATA_KEY,
} from './acl-metadata-keys';

/**
 * The probe is the load-bearing assumption of the whole audit: if it
 * resolves nothing, every route reports as ungranted and the report
 * lies in the permissive direction. These pin it against the real
 * decorators rather than against a remembered constant name.
 */
describe('ACL metadata key probing', () => {
  it('resolves both keys from the public decorators', () => {
    expect(ACL_GRANT_METADATA_KEY).toBeTypeOf('string');
    expect(ACL_QUERY_METADATA_KEY).toBeTypeOf('string');
  });

  it('reads back a grant written by the real decorator', () => {
    class Target {
      handler(): void {}
    }
    AccessControlGrant({
      action: ActionEnum.READ,
      resource: 'invoice',
    })(Target.prototype, 'handler', {
      value: Target.prototype.handler,
    });

    const stored: unknown = Reflect.getMetadata(
      ACL_GRANT_METADATA_KEY as string,
      Target.prototype.handler,
    );

    expect(Array.isArray(stored)).toBe(true);
    expect(stored).toEqual([{ action: ActionEnum.READ, resource: 'invoice' }]);
  });

  it('reads back a query service written by the real decorator', () => {
    class InvoiceCanAccess {
      async canAccess(): Promise<boolean> {
        return true;
      }
    }
    class Target {
      handler(): void {}
    }
    AccessControlQuery({
      service: InvoiceCanAccess as unknown as new () => CanAccess,
    })(Target.prototype, 'handler', { value: Target.prototype.handler });

    const stored: unknown = Reflect.getMetadata(
      ACL_QUERY_METADATA_KEY as string,
      Target.prototype.handler,
    );

    expect(JSON.stringify(stored)).toContain('');
    const entries = Array.isArray(stored) ? stored : [stored];
    expect(
      entries.some(
        (entry) =>
          typeof entry === 'object' &&
          entry !== null &&
          Reflect.get(entry, 'service') === InvoiceCanAccess,
      ),
    ).toBe(true);
  });
});

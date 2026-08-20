import { describe, expect, it } from 'vitest';
import type { Type } from '@nestjs/common';
import {
  AccessControlGrant,
  type CanAccess,
  AccessControlQuery,
} from '@concepta/nestjs-access-control';
import { ActionEnum } from '@concepta/nestjs-core';

import { aclMetadataKeys } from './acl-metadata-keys';

/**
 * The keys are the load-bearing assumption of the whole audit: resolve
 * the wrong ones and every route reads as ungranted — the permissive
 * direction. One read-back test against the REAL decorators pins that
 * `SetMetadata`'s `KEY` and what the decorator writes stay the same
 * thing.
 */
describe('ACL metadata keys', () => {
  it('reads back what the real decorators write, under the resolved keys', () => {
    class InvoiceCanAccess {
      async canAccess(): Promise<boolean> {
        return true;
      }
    }
    class Target {
      handler(): void {}
    }
    AccessControlGrant({ action: ActionEnum.READ, resource: 'invoice' })(
      Target.prototype,
      'handler',
      { value: Target.prototype.handler },
    );
    AccessControlQuery({
      service: InvoiceCanAccess as unknown as Type<CanAccess>,
    })(Target.prototype, 'handler', { value: Target.prototype.handler });

    const keys = aclMetadataKeys();

    expect(Reflect.getMetadata(keys.grant, Target.prototype.handler)).toEqual([
      { action: ActionEnum.READ, resource: 'invoice' },
    ]);

    const query: unknown = Reflect.getMetadata(
      keys.query,
      Target.prototype.handler,
    );
    const entries = Array.isArray(query) ? query : [query];
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

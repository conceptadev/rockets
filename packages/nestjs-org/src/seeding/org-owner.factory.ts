import { Factory } from '@concepta/typeorm-seeding';
import { ReferenceIdInterface } from '@concepta/ts-core';

/**
 * Org Owner factory
 */
export class OrgOwnerFactory extends Factory<ReferenceIdInterface> {
  /**
   * Entity generator
   */
  protected async entity(): Promise<ReferenceIdInterface> {
    throw new Error('Not implemented');
  }
}

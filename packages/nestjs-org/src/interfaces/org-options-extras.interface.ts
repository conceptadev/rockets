import { DynamicModule } from '@nestjs/common';
import { OrgEntitiesOptionsInterface } from './org-entities-options.interface';

export interface OrgOptionsExtrasInterface
  extends Pick<DynamicModule, 'global'>,
    Partial<OrgEntitiesOptionsInterface> {
  /**
   * Replaces all module controllers with this array.
   */
  controllers?: DynamicModule['controllers'];
  /**
   * Appends module controllers with controllers in this array.
   */
  extraControllers?: DynamicModule['controllers'];
  /**
   * Appends module providers with providers in this array.
   */
  extraProviders?: DynamicModule['providers'];
}

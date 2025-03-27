import { DynamicModule } from '@nestjs/common';
import { UserEntitiesOptionsInterface } from './user-entities-options.interface';

export interface UserOptionsExtrasInterface
  extends Pick<DynamicModule, 'global' | 'controllers'>,
    Partial<UserEntitiesOptionsInterface> {
  /**
   * Appends module controllers with controllers in this array.
   */
  extraControllers?: DynamicModule['controllers'];
  /**
   * Appends module providers with providers in this array.
   */
  extraProviders?: DynamicModule['providers'];
}

import { DynamicModule } from '@nestjs/common';

export interface UserOptionsExtrasInterface
  extends Pick<DynamicModule, 'global'> {
  /**
   * Appends module providers with providers in this array.
   */
  extraProviders?: DynamicModule['providers'];
}

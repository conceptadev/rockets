import { DynamicModule } from '@nestjs/common';

export interface OtpOptionsExtrasInterface
  extends Pick<DynamicModule, 'global'> {
  /**
   * Array of entity keys that will be used to look up repositories
   * via getDynamicRepositoryToken()
   */
  entities?: string[];
}

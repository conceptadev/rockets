import { Provider } from '@nestjs/common';
import { TypeOrmExtService } from '../typeorm-ext.service';

/**
 *
 *  Create custom repository provider function
 *
 * @param {string} token repository token
 * @param {string} repoKey repository key
 * @returns {Provider} Repository provider
 */
export function createCustomRepositoryProvider(
  token: string,
  repoKey: string,
): Provider {
  return {
    provide: token,
    useFactory: (configService: TypeOrmExtService) => {
      return configService.getCustomRepository(repoKey);
    },
    inject: [TypeOrmExtService],
  };
}

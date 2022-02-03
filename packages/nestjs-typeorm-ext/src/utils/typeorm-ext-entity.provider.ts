import { Provider } from '@nestjs/common';
import { TypeOrmExtService } from '../typeorm-ext.service';

/**
 * Create repository provider function
 *
 * @param {string} token repository token
 * @param {string} entityKey entity key
 * @returns {Provider} Repository provider
 */
export function createEntityRepositoryProvider(
  token: string,
  entityKey: string,
): Provider {
  return {
    provide: token,
    useFactory: (configService: TypeOrmExtService) => {
      return configService.getEntityRepository(entityKey);
    },
    inject: [TypeOrmExtService],
  };
}

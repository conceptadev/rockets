import { Provider } from '@nestjs/common';
import { TypeOrmExtService } from '../typeorm-ext.service';

/**
 * Create an entity repository provider function
 *
 * @param {string} token Repository token
 * @param {string} entityKey Entity key
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

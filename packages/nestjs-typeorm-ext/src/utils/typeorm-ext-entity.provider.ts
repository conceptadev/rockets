import { Provider } from '@nestjs/common';
import { TypeOrmExtService } from '../typeorm-ext.service';

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

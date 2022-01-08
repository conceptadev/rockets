import { Provider } from '@nestjs/common';
import { TypeOrmConfigService } from '../typeorm-config.service';

export function createTypeOrmEntityProvider(
  token: string,
  entityKey: string,
): Provider {
  return {
    provide: token,
    useFactory: (configService: TypeOrmConfigService) => {
      return configService.getEntityRepository(entityKey);
    },
    inject: [TypeOrmConfigService],
  };
}

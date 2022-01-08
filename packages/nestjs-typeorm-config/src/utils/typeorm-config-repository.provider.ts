import { Provider } from '@nestjs/common';
import { TypeOrmConfigService } from '../typeorm-config.service';

export function createTypeOrmRepositoryProvider(
  token: string,
  repoKey: string,
): Provider {
  return {
    provide: token,
    useFactory: (configService: TypeOrmConfigService) => {
      return configService.getCustomRepository(repoKey);
    },
    inject: [TypeOrmConfigService],
  };
}

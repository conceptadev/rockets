import { Provider } from '@nestjs/common';
import { TypeOrmExtService } from '../typeorm-ext.service';

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

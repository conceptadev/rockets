import { DynamicModule, Global, Module } from '@nestjs/common';
import { TypeOrmExtModule } from '@concepta/nestjs-typeorm-ext';

import { OwnerEntityFixture } from './owner-entity.fixture';
import { OwnerModelServiceFixture } from './owner-model-service.fixture';

@Global()
@Module({
  providers: [OwnerModelServiceFixture],
  exports: [OwnerModelServiceFixture],
})
export class OwnerModuleFixture {
  static register(): DynamicModule {
    return {
      module: OwnerModuleFixture,
      imports: [
        TypeOrmExtModule.forFeature({
          owner: {
            entity: OwnerEntityFixture,
          },
        }),
      ],
    };
  }
}

import { TypeOrmExtModule } from '@concepta/nestjs-typeorm-ext';
import { DynamicModule, Module } from '@nestjs/common';

import { OwnerEntityFixture } from './owner-entity.fixture';
import { OwnerLookupServiceFixture } from './owner-lookup-service.fixture';
import { OwnerRepositoryFixture } from './owner-repository.fixture';

@Module({
  providers: [OwnerLookupServiceFixture],
  exports: [OwnerLookupServiceFixture],
})
export class OwnerModuleFixture {
  static register(): DynamicModule {
    return {
      module: OwnerModuleFixture,
      imports: [
        TypeOrmExtModule.forFeature({
          owner: {
            entity: OwnerEntityFixture,
            repository: OwnerRepositoryFixture,
          },
        }),
      ],
    };
  }
}

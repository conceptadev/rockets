import { TypeOrmExtModule } from '@concepta/nestjs-typeorm-ext';
import { Module } from '@nestjs/common';
import { TestEntityFixture } from './test.entity.fixture';
import { TestModelServiceFixture } from './services/test-model.service.fixture';
import { TestTypeOrmRepositoryServiceFixture } from './services/test-typeorm-repository.service.fixture';

@Module({
  imports: [
    TypeOrmExtModule.forFeature({
      audit: {
        entity: TestEntityFixture,
      },
    }),
  ],
  providers: [TestTypeOrmRepositoryServiceFixture, TestModelServiceFixture],
  exports: [TestTypeOrmRepositoryServiceFixture, TestModelServiceFixture],
})
export class TestModuleFixture {}

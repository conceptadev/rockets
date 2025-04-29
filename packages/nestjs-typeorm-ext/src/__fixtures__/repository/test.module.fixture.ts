import { Module } from '@nestjs/common';
import { TypeOrmExtModule } from '../../typeorm-ext.module';
import { TestEntityFixture } from './test.entity.fixture';
import { TypeOrmRepositoryAdapterFixture } from './services/typeorm-repository.adapter.fixture';
import { TestModelServiceFixture } from '../model/test-model.service.fixture';

@Module({
  imports: [
    TypeOrmExtModule.forFeature({
      audit: {
        entity: TestEntityFixture,
      },
    }),
  ],
  providers: [TypeOrmRepositoryAdapterFixture, TestModelServiceFixture],
  exports: [TypeOrmRepositoryAdapterFixture, TestModelServiceFixture],
})
export class TestModuleFixture {}

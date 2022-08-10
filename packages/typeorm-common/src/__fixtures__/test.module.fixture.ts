import { TypeOrmExtModule } from '@concepta/nestjs-typeorm-ext';
import { Module } from '@nestjs/common';
import { TestEntityFixture } from './test.entity.fixture';
import { TestLookupServiceFixture } from './services/test-lookup.service.fixture';
import { TestMutateServiceFixture } from './services/test-mutate.service.fixture';

@Module({
  imports: [
    TypeOrmExtModule.forFeature({
      audit: {
        entity: TestEntityFixture,
      },
    }),
  ],
  providers: [TestLookupServiceFixture, TestMutateServiceFixture],
  exports: [TestLookupServiceFixture, TestMutateServiceFixture],
})
export class TestModuleFixture {}

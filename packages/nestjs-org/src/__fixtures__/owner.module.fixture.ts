import { DynamicModule, Global, Module } from '@nestjs/common';
import { TypeOrmExtModule } from '@concepta/nestjs-typeorm-ext';
import { OwnerEntityFixture } from './owner-entity.fixture';

@Global()
@Module({})
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

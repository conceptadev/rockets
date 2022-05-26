import { DynamicModule, Module } from '@nestjs/common';
import { TypeOrmExtModule } from '@concepta/nestjs-typeorm-ext';
import { CrudModule } from '../../crud.module';
import { PhotoControllerFixture } from './photo.controller.fixture';
import { PhotoFixture } from './photo.entity.fixture';
import { PhotoRepositoryFixture } from './photo.repository.fixture';
import { PhotoServiceFixture } from './photo.service.fixture';

@Module({
  providers: [PhotoServiceFixture],
  controllers: [PhotoControllerFixture],
})
export class PhotoModuleFixture {
  static register(): DynamicModule {
    return {
      module: PhotoModuleFixture,
      imports: [
        CrudModule.register(),
        TypeOrmExtModule.forFeature({
          photo: { entity: PhotoFixture, repository: PhotoRepositoryFixture },
        }),
      ],
    };
  }
}

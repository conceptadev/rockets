import { Module } from '@nestjs/common';
import { PhotoModuleFixture } from './photo/photo.module.fixture';
import { default as ormConfig } from './ormconfig.fixture';
import { TypeOrmExtModule } from '../typeorm-ext.module';

@Module({
  imports: [
    TypeOrmExtModule.registerAsync({
      useFactory: async () => {
        return ormConfig;
      },
    }),
    PhotoModuleFixture.register(),
  ],
})
export class AppModuleFixture {}

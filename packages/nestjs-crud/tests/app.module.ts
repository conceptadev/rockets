import { Module } from '@nestjs/common';
import { TypeOrmExtModule } from '@rockts-org/nestjs-typeorm-ext';
import { PhotoModule } from './photo/photo.module';
import { default as ormConfig } from './ormconfig';

@Module({
  imports: [
    TypeOrmExtModule.registerAsync({
      useFactory: async () => {
        return ormConfig;
      },
    }),
    PhotoModule.register(),
  ],
})
export class AppModule {}

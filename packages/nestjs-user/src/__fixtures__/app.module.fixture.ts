import { Module } from '@nestjs/common';
import { CrudModule } from '@concepta/nestjs-crud';
import { TypeOrmExtModule } from '@concepta/nestjs-typeorm-ext';
import { UserModule } from '../user.module';
import { default as dbConfig } from './ormconfig.fixture';
import { UserEntityFixture } from './user.entity.fixture';
import { UserRepositoryFixture } from './user.repository.fixture';

@Module({
  imports: [
    TypeOrmExtModule.registerAsync({
      useFactory: async () => {
        return dbConfig;
      },
    }),
    CrudModule.register(),
    UserModule.register({
      orm: {
        entities: { user: { useClass: UserEntityFixture } },
        repositories: { userRepository: { useClass: UserRepositoryFixture } },
      },
    }),
  ],
})
export class AppModuleFixture {}

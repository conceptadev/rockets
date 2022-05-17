import { Module } from '@nestjs/common';
import { CrudModule } from '@concepta/nestjs-crud';
import { TypeOrmExtModule } from '@concepta/nestjs-typeorm-ext';
import { UserModule } from '../user.module';
import { UserModuleCustomFixture } from './user.module.custom.fixture';
import { default as dbConfig } from './ormconfig.fixture';
import { UserLookupCustomService } from './services/user-lookup.custom.service';
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
    UserModule.registerAsync({
      imports: [UserModuleCustomFixture],
      inject: [UserLookupCustomService],
      useFactory: async (userLookupService: UserLookupCustomService) => ({
        userLookupService,
      }),
      orm: {
        entities: { user: { useClass: UserEntityFixture } },
        repositories: { userRepository: { useClass: UserRepositoryFixture } },
      },
    }),
  ],
})
export class AppModuleCustomFixture {}

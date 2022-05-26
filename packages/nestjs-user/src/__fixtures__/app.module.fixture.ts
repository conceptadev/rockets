import { Module } from '@nestjs/common';
import { TypeOrmExtModule } from '@concepta/nestjs-typeorm-ext';
import { CrudModule } from '@concepta/nestjs-crud';
import { UserModule } from '../user.module';
import { default as ormConfig } from './ormconfig.fixture';
import { UserEntityFixture } from './user.entity.fixture';
import { UserRepositoryFixture } from './user.repository.fixture';

@Module({
  imports: [
    TypeOrmExtModule.registerAsync({
      useFactory: async () => {
        return ormConfig;
      },
    }),
    CrudModule.register(),
    UserModule.register({
      entities: {
        user: { entity: UserEntityFixture, repository: UserRepositoryFixture },
      },
    }),
  ],
})
export class AppModuleFixture {}

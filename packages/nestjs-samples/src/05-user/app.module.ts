import { Module } from '@nestjs/common';
import { CrudModule } from '@concepta/nestjs-crud';
import { TypeOrmExtModule } from '@concepta/nestjs-typeorm-ext';
import { UserModule } from '@concepta/nestjs-user';
import { default as dbConfig } from './ormconfig';
import { UserEntity } from './user/user.entity';

@Module({
  imports: [
    TypeOrmExtModule.registerAsync({
      useFactory: async () => {
        return dbConfig;
      },
    }),
    CrudModule.register(),
    UserModule.register({
      entities: {
        user: {
          entity: UserEntity,
        },
      },
    }),
  ],
})
export class AppModule {}

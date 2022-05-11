import { Module } from '@nestjs/common';
import { CrudModule } from '@concepta/nestjs-crud';
import { TypeOrmExtModule } from '@concepta/nestjs-typeorm-ext';
import { UserModule } from '@concepta/nestjs-user';
import { default as dbConfig } from './ormconfig';
import { MyUser } from './custom-user/my-user.entity';
import { MyUserRepository } from './custom-user/my-user.repository';

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
        entities: { user: { useClass: MyUser } },
        repositories: { userRepository: { useClass: MyUserRepository } },
      },
    }),
  ],
})
export class AppModule {}

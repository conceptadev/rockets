import { Module } from '@nestjs/common';
import { CrudModule } from '@concepta/nestjs-crud';
import { TypeOrmExtModule } from '@concepta/nestjs-typeorm-ext';
import { UserModule } from '@concepta/nestjs-user';
import { UserRepository } from './user/user.repository';
import { UserEntity } from './user/user.entity';

@Module({
  imports: [
    TypeOrmExtModule.registerAsync({
      useFactory: async () => {
        return {
          type: 'postgres',
          entities: [UserEntity],
        };
      },
      testMode: true,
    }),
    CrudModule.register(),
    UserModule.register({
      orm: {
        entities: {
          user: { useClass: UserEntity },
        },
        repositories: {
          userRepository: { useClass: UserRepository },
        },
      },
    }),
  ],
})
export class AppModule {}

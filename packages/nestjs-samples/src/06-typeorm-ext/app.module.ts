import { Module } from '@nestjs/common';
import { CrudModule } from '@concepta/nestjs-crud';
import { TypeOrmExtModule } from '@concepta/nestjs-typeorm-ext';
import { UserModule } from '@concepta/nestjs-user';
import { CustomUserRepository } from './custom-repository';
import { CustomUser } from './custom-user.entity';

@Module({
  imports: [
    TypeOrmExtModule.registerAsync({
      useFactory: async () => {
        return {
          type: 'postgres',
        };
      },
      testMode: true,
    }),
    CrudModule.register(),
    UserModule.register({
      orm: {
        entities: {
          user: { useClass: CustomUser },
        },
        repositories: {
          userRepository: { useClass: CustomUserRepository },
        },
      },
    }),
  ],
})
export class AppModule {}

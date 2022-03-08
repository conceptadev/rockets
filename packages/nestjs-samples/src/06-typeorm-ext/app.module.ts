import { Module } from '@nestjs/common';
import { CrudModule } from '@rockts-org/nestjs-crud';
import { TypeOrmExtModule } from '@rockts-org/nestjs-typeorm-ext';
import { UserModule } from '@rockts-org/nestjs-user';
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

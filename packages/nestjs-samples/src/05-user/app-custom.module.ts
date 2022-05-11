import { Module } from '@nestjs/common';
import { CrudModule } from '@concepta/nestjs-crud';
import { TypeOrmExtModule } from '@concepta/nestjs-typeorm-ext';
import { UserModule } from '@concepta/nestjs-user';
import { ConnectionOptions, getConnectionManager } from 'typeorm';
import { CustomUserModule } from './custom-user/custom-user.module';
import { CustomUserLookupService } from './custom-user/custom-user-lookup.service';
import { MyUser } from './custom-user/my-user.entity';
import { MyUserRepository } from './custom-user/my-user.repository';

@Module({
  imports: [
    TypeOrmExtModule.registerAsync({
      useFactory: async () => {
        return {
          type: 'postgres',
        };
      },
      connectionFactory: async (options: ConnectionOptions) => {
        const c = getConnectionManager().create(options);
        c['buildMetadatas']();
        return c;
      },
    }),
    CrudModule.register(),
    UserModule.registerAsync({
      imports: [CustomUserModule],
      inject: [CustomUserLookupService],
      useFactory: async (userLookupService: CustomUserLookupService) => ({
        userLookupService,
        orm: {
          entities: { user: { useClass: MyUser } },
          repositories: { userRepository: { useClass: MyUserRepository } },
        },
      }),
    }),
  ],
})
export class CustomAppModule {}

import { Module } from '@nestjs/common';
import { TypeOrmExtModule } from '@rockts-org/nestjs-typeorm-ext';
import { UserModule } from '@rockts-org/nestjs-user';
import { ConnectionOptions, getConnectionManager } from 'typeorm';
import { CustomUserModule } from './custom-user/custom-user.module';
import { CustomUserService } from './custom-user/custom-user.service';

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
    UserModule.registerAsync({
      imports: [CustomUserModule],
      inject: [CustomUserService],
      useFactory: async (userService: CustomUserService) => ({
        userService,
      }),
    }),
  ],
})
export class CustomAppModule {}

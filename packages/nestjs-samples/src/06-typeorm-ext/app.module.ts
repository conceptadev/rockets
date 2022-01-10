import { Module } from '@nestjs/common';
import { TypeOrmExtModule } from '@rockts-org/nestjs-typeorm-ext';
import { UserModule } from '@rockts-org/nestjs-user';
import { ConnectionOptions, getConnectionManager } from 'typeorm';
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
      connectionFactory: async (options: ConnectionOptions) => {
        const c = getConnectionManager().create(options);
        c['buildMetadatas']();
        return c;
      },
    }),
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

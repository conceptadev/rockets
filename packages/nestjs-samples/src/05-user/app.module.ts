import { Module } from '@nestjs/common';
import { CrudModule } from '@rockts-org/nestjs-crud';
import { TypeOrmExtModule } from '@rockts-org/nestjs-typeorm-ext';
import { UserModule } from '@rockts-org/nestjs-user';
import { ConnectionOptions, getConnectionManager } from 'typeorm';

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
    UserModule.register(),
  ],
})
export class AppModule {}

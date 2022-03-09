import { Module } from '@nestjs/common';
import { CrudModule } from '@rockts-org/nestjs-crud';
import { TypeOrmExtModule } from '@rockts-org/nestjs-typeorm-ext';
import { UserModule } from '@rockts-org/nestjs-user';
import { default as dbConfig } from './ormconfig';

@Module({
  imports: [
    TypeOrmExtModule.registerAsync({
      useFactory: async () => {
        return dbConfig;
      },
    }),
    CrudModule.register(),
    UserModule.register(),
  ],
})
export class AppModule {}

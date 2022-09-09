import { DataSource } from 'typeorm';
import { Module } from '@nestjs/common';
import { CrudModule } from '@concepta/nestjs-crud';
import { TypeOrmExtModule } from '@concepta/nestjs-typeorm-ext';
import { UserModule } from '@concepta/nestjs-user';
import { UserEntity } from './user/user.entity';

@Module({
  imports: [
    TypeOrmExtModule.forRoot({
      type: 'sqlite',
      database: ':memory:',
      entities: [UserEntity],
    }),
    CrudModule.forRoot({}),
    UserModule.register({
      entities: {
        user: {
          entity: UserEntity,
          repositoryFactory: (dataSource: DataSource) =>
            dataSource.getRepository(UserEntity).extend<unknown>({}),
        },
      },
    }),
  ],
})
export class AppModule {}

import { DataSource } from 'typeorm';
import { Module } from '@nestjs/common';
import { CrudModule } from '@concepta/nestjs-crud';
import { TypeOrmExtModule } from '@concepta/nestjs-typeorm-ext';
import { PasswordModule } from '@concepta/nestjs-password';
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
    PasswordModule.forRoot({}),
    UserModule.forRootAsync({
      imports: [
        TypeOrmExtModule.forFeature({
          user: {
            entity: UserEntity,
            repositoryFactory: (dataSource: DataSource) =>
              dataSource.getRepository(UserEntity).extend<unknown>({}),
          },
        }),
      ],
      useFactory: () => ({}),
    }),
  ],
})
export class AppModule {}

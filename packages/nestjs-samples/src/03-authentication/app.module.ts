import { Module } from '@nestjs/common';
import { TypeOrmExtModule } from '@concepta/nestjs-typeorm-ext';
import { AuthLocalModule } from '@concepta/nestjs-auth-local';
import { AuthRefreshModule } from '@concepta/nestjs-auth-refresh';
import { AuthJwtModule } from '@concepta/nestjs-auth-jwt';
import { AuthenticationModule } from '@concepta/nestjs-authentication';
import {
  UserModule,
  UserModelServiceInterface,
  UserModelService,
} from '@concepta/nestjs-user';
import { JwtModule } from '@concepta/nestjs-jwt';
import { PasswordModule } from '@concepta/nestjs-password';
import { CrudModule } from '@concepta/nestjs-crud';
import { CustomUserController } from './user/user.controller';
import { UserEntity } from './user/user.entity';
import { createUserRepository } from './user/create-user-repository';

@Module({
  imports: [
    TypeOrmExtModule.forRoot({
      type: 'sqlite',
      database: ':memory:',
      entities: [UserEntity],
    }),
    AuthLocalModule.registerAsync({
      inject: [UserModelService],
      useFactory: (userModelService: UserModelServiceInterface) => ({
        userModelService,
      }),
    }),
    AuthJwtModule.registerAsync({
      inject: [UserModelService],
      useFactory: (userModelService: UserModelServiceInterface) => ({
        userModelService,
      }),
    }),
    AuthRefreshModule.registerAsync({
      inject: [UserModelService],
      useFactory: (userModelService: UserModelServiceInterface) => ({
        userLookupService: userModelService,
      }),
    }),
    AuthenticationModule.forRoot({}),
    JwtModule.forRoot({}),
    PasswordModule.forRoot({}),
    CrudModule.forRoot({}),
    UserModule.forRoot({
      entities: {
        user: {
          entity: UserEntity,
          repositoryFactory: createUserRepository,
        },
      },
    }),
  ],
  controllers: [CustomUserController],
})
export class AppModule {}

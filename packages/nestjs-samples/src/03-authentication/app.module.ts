import { Module } from '@nestjs/common';
import { TypeOrmExtModule } from '@concepta/nestjs-typeorm-ext';
import { AuthLocalModule } from '@concepta/nestjs-auth-local';
import {
  AuthJwtModule,
  JwtModule,
  AuthRefreshModule,
  AuthenticationCoreModule,
} from '@concepta/nestjs-authentication';
import { UserModule, UserLookupService } from '@concepta/nestjs-user';
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
    AuthLocalModule.registerAsync({ ...createUserOpts() }),
    AuthJwtModule.registerAsync({ ...createUserOpts() }),
    AuthRefreshModule.registerAsync({ ...createUserOpts() }),
    AuthenticationCoreModule.forRoot({}),
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

function createUserOpts() {
  return {
    inject: [UserLookupService],
    useFactory: (userLookupService: UserLookupService) => ({
      userLookupService,
    }),
  };
}

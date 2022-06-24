import { Module } from '@nestjs/common';
import { TypeOrmExtModule } from '@concepta/nestjs-typeorm-ext';
import { AuthLocalModule } from '@concepta/nestjs-auth-local';
import { AuthRefreshModule } from '@concepta/nestjs-auth-refresh';
import { AuthJwtModule } from '@concepta/nestjs-auth-jwt';
import { AuthenticationModule } from '@concepta/nestjs-authentication';
import { UserModule, UserLookupService } from '@concepta/nestjs-user';
import { JwtModule } from '@concepta/nestjs-jwt';
import { PasswordModule } from '@concepta/nestjs-password';
import { CrudModule } from '@concepta/nestjs-crud';
import { CustomUserController } from './user/user.controller';
import { UserEntity } from './user/user.entity';
import { createUserRepository } from './user/create-user-repository';

@Module({
  imports: [
    TypeOrmExtModule.registerAsync({
      useFactory: async () => ({
        type: 'postgres',
        entities: [UserEntity],
      }),
      testMode: true,
    }),
    AuthLocalModule.registerAsync({ ...createUserOpts() }),
    AuthJwtModule.registerAsync({ ...createUserOpts() }),
    AuthRefreshModule.registerAsync({ ...createUserOpts() }),
    AuthenticationModule.register(),
    JwtModule.register(),
    PasswordModule.register(),
    CrudModule.register(),
    UserModule.register({
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
    imports: [UserModule.deferred()],
    inject: [UserLookupService],
    useFactory: (userLookupService: UserLookupService) => ({
      userLookupService,
    }),
  };
}

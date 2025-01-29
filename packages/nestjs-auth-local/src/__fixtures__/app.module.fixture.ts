import { Module } from '@nestjs/common';
import { AuthenticationModule } from '@concepta/nestjs-authentication';
import { JwtModule } from '@concepta/nestjs-jwt';
import { AuthJwtModule } from '@concepta/nestjs-auth-jwt';

// import { default as ormConfig } from './ormconfig.fixture';
import { AuthLocalModule } from '../auth-local.module';
import { UserLookupServiceFixture } from './user/user-lookup.service.fixture';
import { UserModuleFixture } from './user/user.module.fixture';
import { EventModule } from '@concepta/nestjs-event';

@Module({
  imports: [
    JwtModule.forRoot({}),
    AuthenticationModule.forRoot({}),
    EventModule.forRoot({}),
    AuthJwtModule.forRootAsync({
      inject: [UserLookupServiceFixture],
      useFactory: (userLookupService: UserLookupServiceFixture) => ({
        userLookupService,
      }),
    }),
    AuthLocalModule.forRootAsync({
      inject: [UserLookupServiceFixture],
      useFactory: (userLookupService) => ({
        userLookupService,
      }),
    }),
    UserModuleFixture,
  ],
})
export class AppModuleDbFixture {}

import { JwtModule } from '@concepta/nestjs-jwt';
import { Module } from '@nestjs/common';

//import { default as ormConfig } from './ormconfig.fixture';
import { AuthLocalModule } from '../auth-local.module';
import { UserLookupServiceFixture } from './user/user-lookup.service.fixture';
import { UserModuleFixture } from './user/user.module.fixture';

@Module({
  imports: [
    JwtModule.forRoot({}),
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

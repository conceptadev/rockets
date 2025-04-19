import { Global, Module } from '@nestjs/common';
import { UserModelServiceFixture } from './services/user-model.service.fixture';
import { UserPasswordServiceFixture } from './services/user-password.service.fixture';

@Global()
@Module({
  providers: [UserModelServiceFixture, UserPasswordServiceFixture],
  exports: [UserModelServiceFixture, UserPasswordServiceFixture],
})
export class UserModuleFixture {}

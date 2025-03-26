import { Global, Module } from '@nestjs/common';
import { UserLookupServiceFixture } from './user-lookup.service.fixture';
import { UserControllerFixtures } from './user.controller.fixture';

@Global()
@Module({
  controllers: [UserControllerFixtures],
  providers: [UserLookupServiceFixture],
  exports: [UserLookupServiceFixture],
})
export class UserModuleFixture {}

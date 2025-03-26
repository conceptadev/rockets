import { Global, Module } from '@nestjs/common';
import { UserLookupServiceFixture } from './user-lookup.service.fixture';

@Global()
@Module({
  providers: [UserLookupServiceFixture],
  exports: [UserLookupServiceFixture],
})
export class UserModuleFixture {}

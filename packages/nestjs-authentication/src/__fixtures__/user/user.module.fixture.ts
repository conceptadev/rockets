import { Global, Module } from '@nestjs/common';
import { UserLookupServiceFixture } from './services/user-lookup.service.fixture';
import { UserMutateServiceFixture } from './services/user-mutate.service.fixture';

@Global()
@Module({
  providers: [UserLookupServiceFixture, UserMutateServiceFixture],
  exports: [UserLookupServiceFixture, UserMutateServiceFixture],
})
export class UserModuleFixture {}

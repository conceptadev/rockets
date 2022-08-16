import { Global, Module } from '@nestjs/common';
import { UserLookupServiceFixture } from './user-lookup.service.fixture';
import { UserMutateServiceFixture } from './user-mutate.service.fixture';

@Global()
@Module({
  providers: [UserLookupServiceFixture, UserMutateServiceFixture],
  exports: [UserLookupServiceFixture, UserMutateServiceFixture],
})
export class UserModuleFixture {}

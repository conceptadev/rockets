import { Global, Module } from '@nestjs/common';
import { UserLookupServiceFixture } from './services/user-lookup.service.fixture';
import { UserMutateServiceFixture } from './services/user-mutate.service.fixture';
import { InvitationSendServiceFixture } from './services/invitation-send.service.fixture';

@Global()
@Module({
  providers: [
    UserLookupServiceFixture,
    UserMutateServiceFixture,
    InvitationSendServiceFixture,
  ],
  exports: [
    UserLookupServiceFixture,
    UserMutateServiceFixture,
    InvitationSendServiceFixture,
  ],
})
export class UserModuleFixture {}

import { Global, Module } from '@nestjs/common';
import { InvitationSendServiceFixture } from './invitation-send.service.fixture';

@Global()
@Module({
  providers: [InvitationSendServiceFixture],
  exports: [InvitationSendServiceFixture],
})
export class InvitationLocalModuleFixture {}

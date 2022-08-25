import { Global, Module } from '@nestjs/common';
import { MailerServiceFixture } from './mailer.service.fixture';

@Global()
@Module({
  providers: [MailerServiceFixture],
  exports: [MailerServiceFixture],
})
export class GlobalModuleFixture {}

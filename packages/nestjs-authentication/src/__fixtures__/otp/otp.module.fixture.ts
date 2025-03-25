import { Global, Module } from '@nestjs/common';
import { OtpServiceFixture } from './otp.service.fixture';

@Global()
@Module({
  providers: [OtpServiceFixture],
  exports: [OtpServiceFixture],
})
export class OtpModuleFixture {}

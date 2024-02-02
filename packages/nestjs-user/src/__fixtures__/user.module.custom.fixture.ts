import { Global, Module } from '@nestjs/common';
import { UserLookupCustomService } from './services/user-lookup.custom.service';

@Global()
@Module({
  providers: [UserLookupCustomService],
  exports: [UserLookupCustomService],
})
export class UserModuleCustomFixture {}

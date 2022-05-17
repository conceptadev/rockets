import { Module } from '@nestjs/common';
import { UserLookupCustomService } from './services/user-lookup.custom.service';

@Module({
  providers: [UserLookupCustomService],
  exports: [UserLookupCustomService],
})
export class UserModuleCustomFixture {}

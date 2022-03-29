import { Module } from '@nestjs/common';
import { CustomUserService } from './custom-user.service';
import { CustomUserLookupService } from './custom-user-lookup.service';

@Module({
  providers: [CustomUserService, CustomUserLookupService],
  exports: [CustomUserService, CustomUserLookupService],
})
export class CustomUserModule {}

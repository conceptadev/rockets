import { Module } from '@nestjs/common';
import { CustomUserLookupService } from './custom-user-lookup.service';

@Module({
  providers: [CustomUserLookupService],
  exports: [CustomUserLookupService],
})
export class CustomUserModule {}

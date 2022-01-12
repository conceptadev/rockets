import { Module } from '@nestjs/common';
import { CustomUserService } from './custom-user.service';

@Module({
  providers: [CustomUserService],
  exports: [CustomUserService],
})
export class CustomUserModule {}

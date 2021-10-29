import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserLookupService } from './user-lookup.service';
import { UserService } from './user.service';
import { JWT_MODULE_OPTIONS } from '@nestjs/jwt/dist/jwt.constants.js';
import { ConfigService } from '@nestjs/config';
@Module({
  providers: [
    {
      provide: JWT_MODULE_OPTIONS,
      useClass: ConfigService,
    },
    JwtService,
    UserService,
    UserLookupService,
  ],
  exports: [UserService, UserLookupService, JwtService],
})
export class UserModule {}

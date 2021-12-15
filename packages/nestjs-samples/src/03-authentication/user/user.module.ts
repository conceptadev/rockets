import { ConfigService } from '@nestjs/config';
import { IssueTokenService } from './issue-token.service';
import { JWT_MODULE_OPTIONS } from '@nestjs/jwt/dist/jwt.constants.js';
import { JwtService } from '@nestjs/jwt';
import { Module } from '@nestjs/common';
import { UserLookupService } from './user-lookup.service';
import { UserService } from './user.service';
@Module({
  providers: [
    {
      provide: JWT_MODULE_OPTIONS,
      useClass: ConfigService,
    },
    JwtService,
    UserService,
    UserLookupService,
    IssueTokenService,
  ],
  exports: [UserService, UserLookupService, JwtService, IssueTokenService],
})
export class UserModule {}

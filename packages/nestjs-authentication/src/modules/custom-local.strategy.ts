import { Strategy } from 'passport-local';

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CredentialLookupServiceInterface, PasswordStorageService } from '..';

@Injectable()
export class CustomLocalStrategy extends Strategy {
  constructor(
    private userService: CredentialLookupServiceInterface,
    private passwordService: PasswordStorageService,
  ) {
    super(
      {
        usernameField: 'username',
        passwordField: 'password',
      },
      async (username, pass, done) => {
        const user = await this.userService.getUser(username);
        if (!user) {
          throw new UnauthorizedException();
        }

        const isValid = await this.passwordService.validatePassword(
          pass,
          user.password,
          user.salt,
        );
        if (!isValid) throw new UnauthorizedException();

        delete user.password;

        return done(user);
      },
    );
  }
}

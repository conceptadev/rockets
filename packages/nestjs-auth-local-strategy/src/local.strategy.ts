
import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import {  
  CredentialLookupInterface,
  GetUserServiceInterface, 
  PasswordStorageService,
} from '@rockts-org/nestjs-authentication';
import {
  GET_USER_SERVICE_TOKEN, 
} from './config/local.config';
import GenericPassportStrategy from '@rockts-org/nestjs-authentication/dist/generic-passport.strategy';


/**
 * This implementation should be used to use @AuthGuard('local')
 */
@Injectable()
export class LocalStrategy extends GenericPassportStrategy('local') {
  constructor (
    @Inject(GET_USER_SERVICE_TOKEN)
    private userService: GetUserServiceInterface<CredentialLookupInterface>,
    private passwordService: PasswordStorageService,
  ) {
    super();
  }

  async validate(
    username: string,
    pass: string,
  ): Promise<CredentialLookupInterface> {
    
    const user = await this.userService.getUser(username);
    
    if (!user) {
      throw new UnauthorizedException();
    }

    // validate password
    const isValid = await this.passwordService.validatePassword(
      pass,
      user.password,
      user.salt,
    );
    
    if (!isValid) throw new UnauthorizedException();
    
    return user;
  }
}

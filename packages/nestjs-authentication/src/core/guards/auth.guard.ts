import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard as PassportAuthGuard } from '@nestjs/passport';
import {
  AUTHENTICATION_MODULE_DISABLE_GUARDS_TOKEN,
  AUTHENTICATION_MODULE_SETTINGS_TOKEN,
} from '../authentication.constants';
import { AuthGuardCtr, AuthGuardOptions } from '../authentication.types';
import { AuthenticationSettingsInterface } from '../interfaces/authentication-settings.interface';
import { FastifyAuthGuard } from './fastify-auth.guard';

/**
 * A Guard to use passport for express or fastify
 *
 * @example
 * ```ts
 * @UseGuards(AuthGuard('local'))
 * @Post('login')
 * async authenticateWithGuard(
 *   @AuthUser() user: CredentialLookupInterface,
 * ): Promise<AuthenticationResponseInterface> {
 *
 *   const token = this.issueTokenService.issueAccessToken(user.username);
 *
 *   return {
 *     ...user,
 *     ...token,
 *   };
 * }
 * ```
 */
export const AuthGuard = (
  strategyName: string,
  options: AuthGuardOptions = { canDisable: false },
) => {
  // TODO: Add logic to get this information dynamically
  const isExpress = true;

  // the base class
  let AuthGuardBaseClass: AuthGuardCtr;

  if (isExpress) {
    AuthGuardBaseClass = PassportAuthGuard(strategyName);
  } else {
    AuthGuardBaseClass = FastifyAuthGuard(strategyName);
  }

  @Injectable()
  class AuthGuard extends AuthGuardBaseClass implements CanActivate {
    readonly options: AuthGuardOptions = {};

    constructor(
      @Inject(AUTHENTICATION_MODULE_SETTINGS_TOKEN)
      public readonly authenticationSettings: AuthenticationSettingsInterface,
      public readonly reflector: Reflector,
    ) {
      super(strategyName, options);
      this.options = options;
    }

    canActivate(context: ExecutionContext) {
      // does this guard allow disabling?
      if (this.options.canDisable === true) {
        // check if guards are enabled globally, default to true
        const enableGuards =
          this.authenticationSettings?.enableGuards === false ? false : true;

        // guards are disabled globally?
        if (enableGuards === false) {
          // yes, immediate activation
          return true;
        }

        // get the context handler and class
        const contextHandler = context.getHandler();
        const contextClass = context.getClass();

        // check if guards are disabled on the handler or class
        const isDisabled = this.reflector.getAllAndOverride<boolean>(
          AUTHENTICATION_MODULE_DISABLE_GUARDS_TOKEN,
          [contextHandler, contextClass],
        );

        // disabled via context?
        if (isDisabled === true) {
          // yes, immediate activation
          return true;
        }

        // get the disable guard callback from authentication settings, defaults to false
        const disableGuardCb =
          this.authenticationSettings?.disableGuard ?? (() => false);

        // execute callback to determine if guard should be disabled
        // via custom logic for context and guard instance
        const cbDisabled = disableGuardCb(context, this);

        // disabled via callback?
        if (cbDisabled === true) {
          // yes, immediate activation
          return true;
        }
      }

      // call parent
      return super.canActivate(context);
    }
  }

  return AuthGuard;
};

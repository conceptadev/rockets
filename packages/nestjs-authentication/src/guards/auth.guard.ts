import { AuthGuard as PassportAuthGuard } from '@nestjs/passport';
import { FastifyAuthGuard } from './fastify-auth.guard';

/**
 * A Guard to use passport for express or fastify
 *
 * ```ts
 * @UseGuards(GenericAuthGuard('local'))
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
 *   } as AuthenticationResponseInterface;
 * }
 * ```
 */
export const AuthGuard = (strategyName: string) => {
  const isExpress = true;

  if (isExpress) {
    return PassportAuthGuard(strategyName);
  } else {
    // TODO: change to get from fastify
    return FastifyAuthGuard(strategyName);
  }
};

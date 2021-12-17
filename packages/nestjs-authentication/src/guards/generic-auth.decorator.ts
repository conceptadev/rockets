import { AuthGuard } from '@nestjs/passport';
import { FastifyAuthGuard } from './fastify-auth.decorator';

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
const GenericAuthGuard = (strategyName: string) => {
  const isExpress = true;

  if (isExpress) {
    return AuthGuard(strategyName);
  } else {
    // TODO: change to get from fastify
    return FastifyAuthGuard(strategyName);
  }
};

export default GenericAuthGuard;

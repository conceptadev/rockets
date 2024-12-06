import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthenticatedUserInterface } from '../domain/authentication/interfaces/authenticated-user.interface';

/**
 * Decorator that takes a property name as key, and returns the
 * associated value if it exists (or undefined if it doesn't exist,
 * or if the user object has not been created).
 *
 * @example
 * ```ts
 * @Get()
 * async findOne(@AuthUser('firstName') firstName: string) {
 *   console.log(`Hello ${firstName}`);
 * }
 * ```
 */
export const AuthUser = createParamDecorator(
  (data: string, ctx: ExecutionContext): AuthenticatedUserInterface => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    return data ? user?.[data] : user;
  },
);

import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SignupUserCommand } from '../impl/signup-user.command';
import { RocketsAuthUserEntityInterface } from '../../../interfaces/rockets-auth-user-entity.interface';

/**
 * Carries `@CommandHandler(SignupUserCommand)` so subclasses inherit
 * CQRS metadata via the prototype chain — no decorator on the concrete class.
 *
 * Register via `RocketsAuthModule.forRoot({ userCrud: { handlers: { signupHandler } } })`.
 */
@CommandHandler(SignupUserCommand)
export abstract class AbstractSignupUserHandler
  implements ICommandHandler<SignupUserCommand, RocketsAuthUserEntityInterface>
{
  abstract execute(
    command: SignupUserCommand,
  ): Promise<RocketsAuthUserEntityInterface>;
}

import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import type { PasswordStorageInterface } from '@concepta/nestjs-common';
import { PasswordCreationService } from '@concepta/nestjs-password';

/**
 * Rockets-owned command for current-password validation.
 *
 * Using a distinct command keeps the upstream password handler and the
 * aggregate-normalizing Rockets handler from competing for ownership of the
 * same CQRS route.
 */
export class RocketsValidateCurrentPasswordCommand extends Command<boolean> {
  constructor(
    readonly password: string,
    readonly target: PasswordStorageInterface,
  ) {
    super();
  }
}

// TODO(upstream: concepta/nestjs-password) — `PasswordCreationService.validateCurrent`
// flattens the target with `{ password, ...object }` (`password-creation.service.ts:51`),
// which only copies own enumerable fields. v8 `UserCredentials` aggregates expose
// `passwordHash` via getter / `toPlain()` / `.props` — none survive the spread, so the
// upstream check always sees `passwordHash: undefined` and returns `false` for valid
// passwords. Tracked in: .context/upstream-gaps.md (G9). Restore when: upstream
// replaces the spread with `{ password, ...(target?.toPlain?.() ?? target) }` or
// reshapes the contract to require `PasswordStorageInterface` strictly. Then this
// override module + handler can be deleted.
/**
 * Upstream `PasswordCreationService.validateCurrent` flattens the target with
 * `Object.assign({ password }, target)`, which only copies own enumerable
 * fields — getters on the prototype chain and nested `target.props.*` are
 * dropped. v8 `UserCredentials` aggregates expose `passwordHash` exactly that
 * way (getter / nested props), so the upstream check always sees
 * `passwordHash: undefined` and returns `false` for valid passwords.
 *
 * This helper normalizes any of the three known shapes (POJO, aggregate with
 * `toPlain()`, aggregate with `.props`) into a plain
 * `PasswordStorageInterface` before delegating.
 */
function toPasswordStorageInterface(
  target: unknown,
): PasswordStorageInterface | undefined {
  if (!target || typeof target !== 'object') {
    return undefined;
  }
  const o = target as Record<string, unknown> & {
    toPlain?: () => Record<string, unknown>;
  };
  if (typeof o.passwordHash === 'string') {
    return { passwordHash: o.passwordHash };
  }
  if (typeof o.toPlain === 'function') {
    const plain = o.toPlain();
    if (plain && typeof plain.passwordHash === 'string') {
      return { passwordHash: plain.passwordHash };
    }
  }
  const props = o.props as { passwordHash?: string } | undefined;
  if (props && typeof props.passwordHash === 'string') {
    return { passwordHash: props.passwordHash };
  }
  return undefined;
}

/**
 * Handles the Rockets-owned validation command so current-password checks work
 * when `target` is a credentials aggregate (see `toPlain` / `props`).
 */
@Injectable()
@CommandHandler(RocketsValidateCurrentPasswordCommand)
export class RocketsValidateCurrentPasswordHandler
  implements ICommandHandler<RocketsValidateCurrentPasswordCommand, boolean>
{
  constructor(
    private readonly passwordCreationService: PasswordCreationService,
  ) {}

  async execute(
    command: RocketsValidateCurrentPasswordCommand,
  ): Promise<boolean> {
    const normalized = toPasswordStorageInterface(command.target);
    if (!normalized) {
      throw new InternalServerErrorException(
        'RocketsValidateCurrentPasswordCommand received a target without a ' +
          'reachable passwordHash (POJO, aggregate.toPlain(), or .props). ' +
          'Check the upstream caller that built the command.',
      );
    }
    return this.passwordCreationService.validateCurrent({
      password: command.password,
      target: normalized,
    });
  }
}

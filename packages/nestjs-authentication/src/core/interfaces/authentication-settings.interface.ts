import { CanActivate, ExecutionContext } from '@nestjs/common';

export interface AuthenticationSettingsInterface {
  /**
   * Enable or disable guards globally. Defaults to `true`.
   *
   * Only applies to guards that have the `canDisable` setting set to `true`.
   */
  enableGuards?: boolean;

  /**
   * Callback function for determining if a guard should be disabled.
   *
   * Only applies to guards that have the `canDisable` setting set to `true`.
   */
  disableGuard?: <T extends CanActivate>(
    context: ExecutionContext,
    guard: T,
  ) => boolean;
}

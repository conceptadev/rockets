import {
  OptionsAsyncInterface,
  OptionsInterface,
} from '@rockts-org/nestjs-common';

/**
 * User module configuration options interface
 */
export interface UserOptionsInterface extends OptionsInterface {}

/**
 * User async module configuration options interface
 */
export interface UserAsyncOptionsInterface
  extends UserOptionsInterface,
    OptionsAsyncInterface<UserOptionsInterface> {}

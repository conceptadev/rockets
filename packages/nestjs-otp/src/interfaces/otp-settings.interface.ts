import { OptionsInterface } from '@concepta/ts-core';

export interface OtpSettingsInterface extends OptionsInterface {
  //TODO: Change to string to use time span '1h' '2 days' like jwt
  expiresIn: number; // in seconds
}

import { OptionsInterface } from '@concepta/ts-core';

export interface DeferExternalOptionsInterface extends OptionsInterface {
  timeout?: number;
  timeoutMessage?: string;
}

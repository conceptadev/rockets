import { OptionsInterface } from './options.interface';

export interface DeferExternalOptionsInterface extends OptionsInterface {
  timeout?: number;
  timeoutMessage?: string;
}

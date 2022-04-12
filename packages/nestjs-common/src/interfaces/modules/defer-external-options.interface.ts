import { OptionsInterface } from '../options/options.interface';

export interface DeferExternalOptionsInterface extends OptionsInterface {
  timeout?: number;
  timeoutMessage?: string;
}

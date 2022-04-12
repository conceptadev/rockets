import { Type } from '@nestjs/common';
import { OptionsInterface } from '../options/options.interface';

export interface ModuleOptionsControllerInterface extends OptionsInterface {
  controller?: false | Type | Type[];
}

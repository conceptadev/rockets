import { Type } from '@nestjs/common';
import { OptionsInterface } from './options.interface';

export interface ModuleOptionsControllerInterface extends OptionsInterface {
  controller?: false | Type | Type[];
}

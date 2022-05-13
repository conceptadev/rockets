import { Type } from '@nestjs/common';
import { OptionsInterface } from '@concepta/ts-core';

export interface ModuleOptionsControllerInterface extends OptionsInterface {
  controller?: false | Type | Type[];
}

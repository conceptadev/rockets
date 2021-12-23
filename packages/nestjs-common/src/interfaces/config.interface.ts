import { DynamicModule } from '@nestjs/common';
import { OptionsInterface } from '../interfaces/options.interface';

export interface ConfigInterface<T extends OptionsInterface>
  extends Pick<DynamicModule, 'global' | 'imports'> {
  options?: T;
}

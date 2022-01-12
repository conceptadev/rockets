import { IConfigurableDynamicRootModule } from '@golevelup/nestjs-modules';
import { DynamicModule, Type } from '@nestjs/common';
import { DeferExternalOptionsInterface } from '../interfaces/defer-external-options.interface';

export function deferExternal<T, U>(
  moduleCtor: IConfigurableDynamicRootModule<T, U> & Type<T>,
  options: DeferExternalOptionsInterface,
): Promise<DynamicModule> {
  return moduleCtor
    .externallyConfigured(moduleCtor, options?.timeout ?? 2000)
    .catch((e) => {
      if (options?.timeoutMessage && e instanceof Error) {
        throw new Error(`${options.timeoutMessage} ${e.message}`);
      } else {
        throw new Error(`${options.timeoutMessage} ${e.message}`);
      }
    });
}

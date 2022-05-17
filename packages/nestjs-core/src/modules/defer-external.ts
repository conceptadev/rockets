import { IConfigurableDynamicRootModule } from '@golevelup/nestjs-modules';
import { DynamicModule, Type } from '@nestjs/common';
import { DeferExternalOptionsInterface } from './interfaces/defer-external-options.interface';

export async function deferExternal<T, U>(
  moduleCtor: IConfigurableDynamicRootModule<T, U> & Type<T>,
  options: DeferExternalOptionsInterface,
): Promise<DynamicModule> {
  // the default timeout
  const defaultTimeout = process.env?.ROCKETS_MODULE_DEFERRED_TIMEOUT
    ? Number(process.env.ROCKETS_MODULE_DEFERRED_TIMEOUT)
    : 0;

  // defer it
  try {
    return await moduleCtor.externallyConfigured(
      moduleCtor,
      options?.timeout ?? defaultTimeout,
    );
  } catch (e) {
    if (options?.timeoutMessage && e instanceof Error) {
      throw new Error(`${options.timeoutMessage} ${e.message}`);
    } else {
      throw e;
    }
  }
}

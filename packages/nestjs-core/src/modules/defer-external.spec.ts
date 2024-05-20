import { DynamicModule, Type } from '@nestjs/common';
import { IConfigurableDynamicRootModule } from '@golevelup/nestjs-modules';
import { DeferExternalOptionsInterface } from './interfaces/defer-external-options.interface';
import { deferExternal } from './defer-external';

interface TestModule
  extends IConfigurableDynamicRootModule<
      TestModule,
      DeferExternalOptionsInterface
    >,
    Type<TestModule> {
  externallyConfigured: (
    module: TestModule,
    timeout: number,
  ) => Promise<DynamicModule>;
}

describe(deferExternal.name, () => {
  let moduleCtorMock: TestModule;

  beforeEach(() => {
    moduleCtorMock = {
      externallyConfigured: jest.fn(),
    } as unknown as TestModule;
  });

  it('should use default timeout when no environment variable set', async () => {
    delete process.env.ROCKETS_MODULE_DEFERRED_TIMEOUT;
    const options = { timeout: 5000 };
    (moduleCtorMock.externallyConfigured as jest.Mock).mockResolvedValue(
      'ExpectedModule',
    );

    const result = await deferExternal(moduleCtorMock, options);

    expect(moduleCtorMock.externallyConfigured).toHaveBeenCalledWith(
      moduleCtorMock,
      5000,
    );
    expect(result).toBe('ExpectedModule');
  });

  it('should use environment variable timeout when set', async () => {
    process.env.ROCKETS_MODULE_DEFERRED_TIMEOUT = '3000';
    const options = {};
    (moduleCtorMock.externallyConfigured as jest.Mock).mockResolvedValue(
      'ExpectedModule',
    );

    const result = await deferExternal(moduleCtorMock, options);

    expect(moduleCtorMock.externallyConfigured).toHaveBeenCalledWith(
      moduleCtorMock,
      3000,
    );
    expect(result).toBe('ExpectedModule');
  });

  it('should throw custom error when externallyConfigured fails and timeoutMessage is provided', async () => {
    const options = { timeoutMessage: 'Custom Error:' };
    const error = new Error('Original Error');
    (moduleCtorMock.externallyConfigured as jest.Mock).mockRejectedValue(error);

    await expect(deferExternal(moduleCtorMock, options)).rejects.toThrow(
      'Custom Error: Original Error',
    );
  });

  it('should propagate the error from externallyConfigured when no timeoutMessage is provided', async () => {
    const options = {};
    const error = new Error('Failure');
    (moduleCtorMock.externallyConfigured as jest.Mock).mockRejectedValue(error);

    await expect(deferExternal(moduleCtorMock, options)).rejects.toThrow(
      'Failure',
    );
  });
});

import { describe, expect, it, vi } from 'vitest';
import { applyControllerExtras } from './apply-controller-extras.helper';

describe('applyControllerExtras', () => {
  it('applies class and route decorators to a generated controller', () => {
    const classDecorator = vi.fn((_target: Function) => undefined);
    const methodDecorator = vi.fn(
      (
        _target: object,
        _propertyKey: string | symbol,
        _descriptor: PropertyDescriptor,
      ) => undefined,
    );

    class TestController {
      ping(): void {}
    }

    const descriptor = Object.getOwnPropertyDescriptor(
      TestController.prototype,
      'ping',
    );

    applyControllerExtras(
      TestController,
      {
        classDecorators: [classDecorator],
        routes: { ping: { decorators: [methodDecorator] } },
      },
      { ping: 'ping' },
    );

    expect(classDecorator).toHaveBeenCalledWith(TestController);
    expect(methodDecorator).toHaveBeenCalledWith(
      TestController.prototype,
      'ping',
      descriptor,
    );
  });
});

import { CrudRoutesFactory } from '@nestjsx/crud';
import { CrudDecoratorOptionsInterface } from '../interfaces/crud-decorator-options.interface';

/**
 * CRUD decorator wrapper
 */

// eslint-disable-next-line @typescript-eslint/ban-types
export const Crud =
  // eslint-disable-next-line @typescript-eslint/ban-types
  (options: CrudDecoratorOptionsInterface) => (target: Object) => {
    const factoryMethod = CrudRoutesFactory;
    let factory = new factoryMethod(target, options);
    factory = undefined;
  };

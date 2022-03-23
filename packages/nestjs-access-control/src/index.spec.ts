import { AccessControlGuard } from './index';
import { AccessControlModule } from './index';
import { AccessControlCreateOne } from './index';
import { AccessControlDeleteOne } from './index';
import { AccessControlFilter } from './index';
import { AccessControlGrant } from './index';
import { AccessControlReadMany } from './index';
import { AccessControlReadOne } from './index';
import { AccessControlUpdateOne } from './index';
import { InjectAccessControl } from './index';
import { UseAccessControl } from './index';
import { AccessControlAction } from './index';
import { AccessControlFilterType } from './index';

describe('Index', () => {
  // modules
  it('All exported modules should be imported', () => {
    expect(AccessControlGuard).toEqual(expect.any(Function));
    expect(AccessControlModule).toEqual(expect.any(Function));
  });

  // decorators
  it('All exported decorators should be imported', () => {
    expect(AccessControlCreateOne).toEqual(expect.any(Function));
    expect(AccessControlDeleteOne).toEqual(expect.any(Function));
    expect(AccessControlFilter).toEqual(expect.any(Function));
    expect(AccessControlGrant).toEqual(expect.any(Function));
    expect(AccessControlReadMany).toEqual(expect.any(Function));
    expect(AccessControlReadOne).toEqual(expect.any(Function));
    expect(AccessControlUpdateOne).toEqual(expect.any(Function));
    expect(InjectAccessControl).toEqual(expect.any(Function));
    expect(UseAccessControl).toEqual(expect.any(Function));
  });

  // enums
  it('All exported enums should be imported', () => {
    expect(AccessControlAction).toEqual(expect.any(Object));
    expect(AccessControlFilterType).toEqual(expect.any(Object));
  });

  // bad test check
  it('Should fail', () => {
    expect(1).toEqual(2);
  });
});

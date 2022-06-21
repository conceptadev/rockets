import {
  AccessControlAction,
  AccessControlCreateMany,
  AccessControlCreateOne,
  AccessControlDeleteOne,
  AccessControlFilter,
  AccessControlFilterType,
  AccessControlGrant,
  AccessControlGuard,
  AccessControlModule,
  AccessControlReadMany,
  AccessControlReadOne,
  AccessControlReplaceOne,
  AccessControlUpdateOne,
  UseAccessControl,
} from './index';

describe('Index', () => {
  // modules
  it('All exported modules should be imported', () => {
    expect(AccessControlGuard).toEqual(expect.any(Function));
    expect(AccessControlModule).toEqual(expect.any(Function));
  });

  // decorators
  it('All exported decorators should be imported', () => {
    expect(AccessControlCreateMany).toEqual(expect.any(Function));
    expect(AccessControlCreateOne).toEqual(expect.any(Function));
    expect(AccessControlDeleteOne).toEqual(expect.any(Function));
    expect(AccessControlFilter).toEqual(expect.any(Function));
    expect(AccessControlGrant).toEqual(expect.any(Function));
    expect(AccessControlReadMany).toEqual(expect.any(Function));
    expect(AccessControlReadOne).toEqual(expect.any(Function));
    expect(AccessControlUpdateOne).toEqual(expect.any(Function));
    expect(AccessControlReplaceOne).toEqual(expect.any(Function));
    expect(UseAccessControl).toEqual(expect.any(Function));
  });

  // enums
  it('All exported enums should be imported', () => {
    expect(AccessControlAction).toEqual(expect.any(Object));
    expect(AccessControlFilterType).toEqual(expect.any(Object));
  });
});

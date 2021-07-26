import { AccessControlFilterType } from './access-control-filter-type.enum';

describe('Access control action enumeration', () => {
  it('should match specification', () => {
    expect(AccessControlFilterType).toEqual({
      QUERY: 'query',
      BODY: 'body',
      PATH: 'params',
    });
  });
});

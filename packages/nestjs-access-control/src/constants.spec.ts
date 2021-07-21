import { ACCESS_CONTROL_CTLR_CONFIG_KEY } from './constants';
import { ACCESS_CONTROL_FILTERS_CONFIG_KEY } from './constants';
import { ACCESS_CONTROL_GRANT_CONFIG_KEY } from './constants';
import { ACCESS_CONTROL_OPTIONS_KEY } from './constants';

describe('Constants', () => {
  it('Should each match expected value', () => {
    expect(ACCESS_CONTROL_CTLR_CONFIG_KEY).toEqual('ACCESS_CONTROL_CTLR');
    expect(ACCESS_CONTROL_FILTERS_CONFIG_KEY).toEqual('ACCESS_CONTROL_FILTERS');
    expect(ACCESS_CONTROL_GRANT_CONFIG_KEY).toEqual('ACCESS_CONTROL_GRANTS');
    expect(ACCESS_CONTROL_OPTIONS_KEY).toEqual('ACCESS_CONTROL_OPTIONS');
  });
});

import { 
  createConfigurableDynamicRootModule, 
  deferExternal, 
  negotiateController 
} from './index';

describe('index', () => {
  it('should export functions', () => {
    expect(createConfigurableDynamicRootModule).toBeInstanceOf(Function);
    expect(deferExternal).toBeInstanceOf(Function);
    expect(negotiateController).toBeInstanceOf(Function);
  });
});
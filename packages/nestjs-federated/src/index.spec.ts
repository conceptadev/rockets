import {
  FederatedModule,
  FederatedService,
  FederatedOAuthService,
  FederatedDto,
  FederatedCreateDto,
  FederatedUpdateDto,
} from './index';

describe('Federated Module', () => {
  it('should be a function', () => {
    expect(FederatedModule).toBeInstanceOf(Function);
  });
});

describe('Federated Service', () => {
  it('should be a function', () => {
    expect(FederatedService).toBeInstanceOf(Function);
  });
});

describe('Federated OAuth Service', () => {
  it('should be a function', () => {
    expect(FederatedOAuthService).toBeInstanceOf(Function);
  });
});

describe('Federated Dto', () => {
  it('should be a function', () => {
    expect(FederatedDto).toBeInstanceOf(Function);
  });
});

describe('Federated Create Dto', () => {
  it('should be a function', () => {
    expect(FederatedCreateDto).toBeInstanceOf(Function);
  });
});

describe('Federated Update Dto', () => {
  it('should be a function', () => {
    expect(FederatedUpdateDto).toBeInstanceOf(Function);
  });
});

import { SetMetadata } from '@nestjs/common';
import { AUTHENTICATION_MODULE_DISABLE_GUARDS_TOKEN } from '../authentication.constants';
import { AuthPublic } from './auth-public.decorator';

jest.mock('@nestjs/common', () => {
  return {
    SetMetadata: jest.fn().mockImplementation(() => 'mocked SetMetadata'), // Mock SetMetadata
  };
});

describe(AuthPublic.name, () => {
  it('should set metadata to disable guards', () => {
    AuthPublic();
    // Assert that SetMetadata was called with specific arguments
    expect(SetMetadata).toHaveBeenCalledWith(
      AUTHENTICATION_MODULE_DISABLE_GUARDS_TOKEN,
      true,
    );
  });
});

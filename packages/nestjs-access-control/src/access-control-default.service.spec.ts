import { ExecutionContext } from '@nestjs/common';
import { HttpArgumentsHost } from '@nestjs/common/interfaces';
import { Test, TestingModule } from '@nestjs/testing';
import { mock } from 'jest-mock-extended';
import { AccessControlDefaultService } from './access-control-default.service';

describe('AccessControlDefaultService', () => {
  let service: AccessControlDefaultService;
  let spyGetUserRoles: jest.SpyInstance;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AccessControlDefaultService],
    }).compile();

    service = module.get<AccessControlDefaultService>(
      AccessControlDefaultService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(service).toBeInstanceOf(AccessControlDefaultService);
  });

  it('should define getUser', () => {
    const context = mock<ExecutionContext>();
    const argsHost = mock<HttpArgumentsHost>();
    context.getHandler.mockReturnValue(service.getUser);
    context.switchToHttp.mockReturnValue(argsHost);
    const getUser = service.getUser(context);
    expect(getUser).toBeDefined();
  });

  // spyGetUserRoles = jest.spyOn(service, 'getUser');

  it('should define getUserRoles', () => {
    const context = mock<ExecutionContext>();

    context.getHandler.mockReturnValue(service.getUserRoles);
    const getUserRoles = service.getUserRoles(context);
    expect(getUserRoles).toBeDefined();
  });
});

// import { ExecutionContext } from '@nestjs/common';
// import { HttpArgumentsHost } from '@nestjs/common/interfaces';
// import { mock } from 'jest-mock-extended';
import { Test, TestingModule } from '@nestjs/testing';
import { AccessControlDefaultService } from './access-control-default.service';

describe('AccessControlDefaultService', () => {
  let service: AccessControlDefaultService;

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

  // it('should define getUser', () => {
  //   const context = mock<ExecutionContext>();
  //   const argsHost = mock<HttpArgumentsHost>();
  //   context.getHandler.mockReturnValue(service.getUser);
  //   context.switchToHttp.mockReturnValue(argsHost);
  //   const getUser = service.getUser(context);
  //   expect(getUser).toBeDefined();
  // });

  // it('should define getUserRoles', () => {
  //   const context = mock<ExecutionContext>();
  //   context.getHandler.mockReturnValue(service.getUserRoles);
  //   const getUserRoles = service.getUserRoles(context);
  //   expect(getUserRoles).toBeDefined();
  // });
});

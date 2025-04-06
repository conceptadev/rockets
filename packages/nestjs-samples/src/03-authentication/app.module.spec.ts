import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from './app.module';
import { IssueTokenService } from '@concepta/nestjs-authentication';
import {
  AuthLocalController,
  AuthLocalUserLookupService,
  AuthLocalUserLookupServiceInterface,
} from '@concepta/nestjs-auth-local';
import { UserCrudService } from '@concepta/nestjs-user';

describe('AppModule', () => {
  it('should be imported', async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(UserCrudService)
      .useValue({})
      .compile();

    const issueTokenService = module.get<IssueTokenService>(IssueTokenService);
    const userLookupService = module.get<AuthLocalUserLookupServiceInterface>(
      AuthLocalUserLookupService,
    );
    const authLocalcontroller = module.get(AuthLocalController);

    expect(module).toBeInstanceOf(TestingModule);
    expect(issueTokenService).toBeInstanceOf(IssueTokenService);
    expect(userLookupService).toBeInstanceOf(Object);
    expect(authLocalcontroller).toBeInstanceOf(AuthLocalController);
    expect(authLocalcontroller['issueTokenService']).toBeInstanceOf(
      IssueTokenService,
    );

    await module.close();
  });
});

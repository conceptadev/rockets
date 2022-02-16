import supertest from 'supertest';

import { Test, TestingModule } from '@nestjs/testing';

import { AppModule } from './app.module';
import { INestApplication } from '@nestjs/common';
import { TestUserRepository } from './user/user.repository';
import { mock } from 'jest-mock-extended';
import { User, UserCrudService } from '@rockts-org/nestjs-user';
import { HttpExceptionFilter } from '@rockts-org/nestjs-common';


const sleep = (ms) => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
};

describe('AppController (e2e)', () => {
  describe('Authentication', () => {
    let app: INestApplication;

    beforeEach(async () => {
      const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [AppModule],
      })
        .overrideProvider('USER_MODULE_USER_ENTITY_REPO_TOKEN')
        .useValue(mock<User>())
        .overrideProvider('USER_MODULE_USER_CUSTOM_REPO_TOKEN')
        .useValue(new TestUserRepository())
        .overrideProvider(UserCrudService)
        .useValue({})
        .compile();

      app = moduleFixture.createNestApplication();
      
      app.useGlobalFilters(new HttpExceptionFilter());
      
      await app.init();
    });

    afterEach(async () => {
      jest.clearAllMocks();
      await app.close();
    });
 
    it('GET /error', async () => {
      await supertest(app.getHttpServer()).get('/custom/user/error')
        .then((response) => { 
          console.log('response', response.body);

        })
        .catch((error) => { 
          console.log('>>>>>>>>>>>>');
          console.log(error);
      });
    });
  });

});

import supertest from 'supertest';
import { Test } from '@nestjs/testing';
import { UserModule } from '@concepta/nestjs-user';
import { INestApplication } from '@nestjs/common';
import { TypeOrmExtModule } from '@concepta/nestjs-typeorm-ext';

import { SwaggerUiModule } from './swagger-ui.module';
import { UserEntityFixture } from './__fixtures__/user.entity.fixture';
import { SchemaController } from './schema.controller';

describe(SwaggerUiModule, () => {
  let app: INestApplication;

  const moduleOptions = {
    settings: {
      path: 'api',
      basePath: '/v1',
      jsonSchemaFilePath: `${__dirname}/../jsonSchema-v4.json`,
      openApiFilePath: `${__dirname}/../open-api-v3.json`,
    },
  };

  describe(SchemaController.name, () => {
    beforeAll(async () => {
      const moduleFixture = await Test.createTestingModule({
        imports: [
          TypeOrmExtModule.forRoot({
            type: 'sqlite',
            database: ':memory:',
            synchronize: true,
            entities: [UserEntityFixture],
          }),
          UserModule.forRoot({
            entities: {
              user: {
                entity: UserEntityFixture,
              },
            },
          }),
          SwaggerUiModule.register(moduleOptions),
        ],
      }).compile();
      app = moduleFixture.createNestApplication();
      await app.init();
    });

    it('download open api schema', async () => {
      const response = await supertest(app.getHttpServer())
        .get('/schema/open-api-v3')
        .expect(200);

      expect(response.body).toBeTruthy();
    });
  });
});

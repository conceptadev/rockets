import supertest from 'supertest';
import { Test } from '@nestjs/testing';
import { UserModule } from '@concepta/nestjs-user';
import { INestApplication } from '@nestjs/common';
import { TypeOrmExtModule } from '@concepta/nestjs-typeorm-ext';
import { CrudModule } from '@concepta/nestjs-crud';

import { SwaggerUiModule } from './swagger-ui.module';
import { UserEntityFixture } from './__fixtures__/user.entity.fixture';
import { SchemaController } from './schema.controller';
import { SwaggerUiService } from './swagger-ui.service';

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
          CrudModule.forRoot({}),
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

      const swaggerUiService = app.get(SwaggerUiService);
      expect(swaggerUiService).toBeInstanceOf(SwaggerUiService);
      swaggerUiService.setup(app);
    });

    it('download open api schema', async () => {
      const response = await supertest(app.getHttpServer())
        .get('/schema/open-api-v3')
        .expect(200);

      const { text } = response;

      expect(text).toContain('"openapi": "3.0.0"');
      expect(text).toContain('"/user/{id}"');
    });

    it('download json schema', async () => {
      const response = await supertest(app.getHttpServer())
        .get('/schema/json-v4')
        .expect(200);

      const { text } = response;

      expect(text).toContain('UserDto');
      expect(text).toContain('UserCreateDto');
    });
  });
});

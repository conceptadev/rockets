import supertest from 'supertest';

import { Test, TestingModule } from '@nestjs/testing';

import { AppModule } from './app.module';
import { INestApplication } from '@nestjs/common';
import { CreateOrderDto } from './order/dto/create-order.dto';

import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';

describe('AppController (e2e)', () => {
  describe('Express', () => {
    let app: INestApplication;
    let spySync: jest.SpyInstance;

    beforeEach(async () => {
      const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [AppModule],
      }).compile();

      app = moduleFixture.createNestApplication();
      await app.init();
    });

    afterEach(async () => {
      jest.clearAllMocks();
      await app.close();
    });

    it('POST /orders/sync', async () => {
      const order: CreateOrderDto = {
        name: 'Order 1',
        description: 'My First Order',
      };

      await supertest(app.getHttpServer())
        .post('/orders/sync')
        .send(order)
        .expect(201)
        .expect({ id: 3, ...order });

      expect(spySync).toHaveBeenCalledTimes(1);

      return;
    });
  });

  describe('Fastify', () => {
    let app: NestFastifyApplication;
    let spySync: jest.SpyInstance;

    beforeEach(async () => {
      const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [AppModule],
      }).compile();

      app = moduleFixture.createNestApplication<NestFastifyApplication>(
        new FastifyAdapter(),
      );

      await app.init();
    });

    afterEach(async () => {
      jest.clearAllMocks();
      await app.close();
    });

    it('POST /orders/sync', async () => {
      const order: CreateOrderDto = {
        name: 'Order 1',
        description: 'My First Order',
      };

      return app
        .inject({
          method: 'POST',
          url: '/orders/sync',
          payload: order,
        })
        .then(({ statusCode, payload }) => {
          expect(statusCode).toEqual(201);
          expect(JSON.parse(payload)).toEqual({ id: 3, ...order });
          expect(spySync).toHaveBeenCalledTimes(1);
        });
    });
  });
});

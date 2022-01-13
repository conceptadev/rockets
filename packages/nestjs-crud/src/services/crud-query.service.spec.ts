import { Test } from '@nestjs/testing';
import { CrudRequest } from '@nestjsx/crud';
import { CrudQueryService } from './crud-query.service';
import { mock } from 'jest-mock-extended';
import { CrudQueryOptionsInterface } from '../interfaces/crud-query-options.interface';
import { SCondition } from '@nestjsx/crud-request';

describe('TypeOrmService', () => {
  let crudQueryService: CrudQueryService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [CrudQueryService],
    }).compile();

    crudQueryService = moduleRef.get<CrudQueryService>(CrudQueryService);
  });

  describe('IsDefined', () => {
    it('was CrudQueryService defined', async () => {
      expect(crudQueryService).toBeDefined();
    });
  });

  describe('modifyRequest', () => {
    describe('when adding search', () => {
      it('should add search', async () => {
        const req: CrudRequest = mock<CrudRequest>();

        req.parsed.search = {
          name: 'apple',
        };

        const options: CrudQueryOptionsInterface = {
          search: {
            name: 'pear',
          },
        };

        crudQueryService.modifyRequest(req, options);

        expect(req.parsed.search).toEqual<SCondition>({
          $and: [
            {
              name: 'apple',
            },
            {
              name: 'pear',
            },
          ],
        });
      });
    });

    describe('when adding options', () => {
      it('should setup alwaysPaginate options', async () => {
        // the fake request
        const req: CrudRequest = mock<CrudRequest>();

        // mock some options on the request
        req.options.query = { alwaysPaginate: true };

        const options: CrudQueryOptionsInterface = {
          query: { alwaysPaginate: true },
        };

        crudQueryService.modifyRequest(req, options);

        expect(req.options.query.alwaysPaginate).toEqual(true);
      });

      it('should setup sort options', async () => {
        const req: CrudRequest = mock<CrudRequest>();

        req.options.query = { sort: [{ field: 'id', order: 'ASC' }] };

        const options: CrudQueryOptionsInterface = {
          query: { sort: [{ field: 'id', order: 'ASC' }] },
        };

        crudQueryService.modifyRequest(req, options);

        expect(req.options.query.sort).toEqual([
          {
            field: 'id',
            order: 'ASC',
          },
        ]);
      });

      it('should setup limit option', async () => {
        const req: CrudRequest = mock<CrudRequest>();

        req.options.query = { limit: 10 };

        const options: CrudQueryOptionsInterface = {
          query: { limit: 10 },
        };

        crudQueryService.modifyRequest(req, options);

        expect(req.options.query.limit).toEqual(10);
      });

      it('should setup join option', async () => {
        const req: CrudRequest = mock<CrudRequest>();

        req.options.query = { join: { user: { eager: true } } };

        const options: CrudQueryOptionsInterface = {
          query: { join: { user: { eager: true } } },
        };

        crudQueryService.modifyRequest(req, options);

        expect(req.options.query.join).toEqual({
          user: { eager: true },
        });
      });

      it('should setup exclude option', async () => {
        const req: CrudRequest = mock<CrudRequest>();

        req.options.query = {
          exclude: ['id', 'createdAt', 'updatedAt'],
        };

        const options: CrudQueryOptionsInterface = {
          query: { exclude: ['id', 'createdAt', 'updatedAt'] },
        };

        crudQueryService.modifyRequest(req, options);

        expect(req.options.query.exclude).toEqual([
          'id',
          'createdAt',
          'updatedAt',
        ]);
      });

      it('should setup allow option', async () => {
        const req: CrudRequest = mock<CrudRequest>();

        req.options.query = {
          allow: ['id', 'createdAt', 'updatedAt'],
        };

        const options: CrudQueryOptionsInterface = {
          query: { allow: ['id', 'createdAt', 'updatedAt'] },
        };

        crudQueryService.modifyRequest(req, options);

        expect(req.options.query.allow).toEqual([
          'id',
          'createdAt',
          'updatedAt',
        ]);
      });

      it('should setup maxLimit option', async () => {
        const req: CrudRequest = mock<CrudRequest>();

        req.options.query = { maxLimit: 10 };

        const options: CrudQueryOptionsInterface = {
          query: { maxLimit: 10 },
        };

        crudQueryService.modifyRequest(req, options);

        expect(req.options.query.maxLimit).toEqual(10);
      });

      it('should setup cache option', async () => {
        const req: CrudRequest = mock<CrudRequest>();

        req.options.query = { cache: false };

        const options: CrudQueryOptionsInterface = {
          query: { cache: false },
        };

        crudQueryService.modifyRequest(req, options);

        expect(req.options.query.cache).toEqual(false);
      });

      it('should setup softDelete option', async () => {
        const req: CrudRequest = mock<CrudRequest>();

        req.options.query = { softDelete: true };

        const options: CrudQueryOptionsInterface = {
          query: { softDelete: true },
        };

        crudQueryService.modifyRequest(req, options);

        expect(req.options.query.softDelete).toEqual(true);
      });

      it('should setup persist option', async () => {
        const req: CrudRequest = mock<CrudRequest>();

        req.options.query = {
          persist: ['id', 'createdAt', 'updatedAt'],
        };

        const options: CrudQueryOptionsInterface = {
          query: { persist: ['id', 'createdAt', 'updatedAt'] },
        };

        crudQueryService.modifyRequest(req, options);

        expect(req.options.query.persist).toEqual([
          'id',
          'createdAt',
          'updatedAt',
        ]);
      });
    });
  });
});

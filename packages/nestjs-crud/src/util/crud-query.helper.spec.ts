import { Test } from '@nestjs/testing';
import { CrudRequest, QueryOptions } from '@nestjsx/crud';
import { CrudQueryHelper } from './crud-query.helper';
import { CrudQueryOptionsInterface } from '../interfaces/crud-query-options.interface';
import { SCondition } from '@nestjsx/crud-request';

describe('TypeOrmService', () => {
  let crudQueryService: CrudQueryHelper;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [CrudQueryHelper],
    }).compile();

    crudQueryService = moduleRef.get<CrudQueryHelper>(CrudQueryHelper);
  });

  describe('IsDefined', () => {
    it('was CrudQueryService defined', async () => {
      expect(crudQueryService).toBeDefined();
    });
  });

  describe('modifyRequest', () => {
    describe('when adding search', () => {
      it('should add search', async () => {
        // the fake request
        const req = { parsed: {} } as CrudRequest;

        req.parsed.search = {
          name: 'apple',
        };

        const options: CrudQueryOptionsInterface = {
          filter: {
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
      it('should add options', async () => {
        // the fake request
        const req = {
          options: { query: { alwaysPaginate: true } },
        } as CrudRequest;

        const options: CrudQueryOptionsInterface = {
          cache: false,
        };

        crudQueryService.modifyRequest(req, options);

        expect(req.options.query).toEqual<QueryOptions>({
          alwaysPaginate: true,
          cache: false,
        });
      });
    });
  });
});

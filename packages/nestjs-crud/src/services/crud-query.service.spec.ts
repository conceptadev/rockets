import { Test } from '@nestjs/testing';
import { CrudQueryService } from './crud-query.service';
// import { mock } from 'jest-mock-extended';

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
    describe('when adding options', () => {
      // it('should add options', async () => {
      //   const req = {
      //     options: {},
      //   };
      //   const options = {
      //     search: '',
      //   };
      //   crudQueryService.modifyRequest(req, options);
      //   expect(req.options).toEqual(options);
      // });
      const addOption = jest.fn().mockReturnValue({
        addOptions: jest.fn().mockReturnValue({
          query: { join: { company: { eager: false } } },
        }),
      });

      // crudQueryService.modifyRequest(req, options);
    });

    describe('when adding search', () => {
      it('should add search', () => {
        const addSearch = jest.fn().mockReturnValue({
          addSearch: jest.fn().mockReturnValue({
            name: {
              $eq: 'apple',
            },
          }),
        });
      });
    });
  });
});

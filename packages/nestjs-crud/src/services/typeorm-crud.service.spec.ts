import { Test } from '@nestjs/testing';
import { Repository } from 'typeorm';
import { CreateManyDto, CrudRequest } from '@nestjsx/crud';
import { TypeOrmCrudService as JsxTypeOrmCrudService } from '@nestjsx/crud-typeorm/lib/typeorm-crud.service';
import { TypeOrmCrudService } from './typeorm-crud.service';
import { CrudQueryHelper } from '../util/crud-query.helper';
import { Type } from '@nestjs/common';
import { CrudQueryOptionsInterface } from '../interfaces/crud-query-options.interface';

jest.mock('@nestjsx/crud-typeorm/lib/typeorm-crud.service');

describe('TypeOrmService', () => {
  // fake entity/repo
  class Thing {}
  class ThingRepository extends Repository<Thing> {}

  // test orm service
  class TestOrmService extends TypeOrmCrudService<Thing> {}

  let ormService: TestOrmService;
  let mockRequest: CrudRequest;
  let mockOverrides: CrudQueryOptionsInterface;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        TestOrmService,
        CrudQueryHelper,
        { provide: Repository, useValue: new ThingRepository() },
      ],
    }).compile();

    ormService = moduleRef.get<TestOrmService>(TestOrmService);

    mockRequest = {
      options: { query: { alwaysPaginate: true } },
      parsed: { search: { name: 'apple' } },
    } as unknown as CrudRequest;

    mockOverrides = {
      filter: { name: 'pear' },
      alwaysPaginate: false,
    };
  });

  afterEach(async () => {
    jest.resetAllMocks();
  });

  describe('simple crud methods', () => {
    type SingleArg = keyof Pick<
      TestOrmService,
      'getMany' | 'getOne' | 'deleteOne'
    >;

    const crudMethods: SingleArg[] = ['getMany', 'getOne', 'deleteOne'];

    it.each(crudMethods)(
      '%s should use custom options',
      async (crudMethod: SingleArg) => {
        const spy = jest.spyOn(JsxTypeOrmCrudService.prototype, crudMethod);

        await ormService[crudMethod](mockRequest, mockOverrides);

        expect(spy).toBeCalledTimes(1);

        expect(spy).toBeCalledWith({
          options: { query: { alwaysPaginate: false } },
          parsed: {
            search: { $and: [{ name: 'apple' }, { name: 'pear' }] },
          },
        });
      },
    );
  });

  describe('complex crud methods (have dto argument)', () => {
    type DoubleArg = keyof Pick<
      TestOrmService,
      'createMany' | 'createOne' | 'updateOne' | 'replaceOne'
    >;

    const crudMethods: DoubleArg[] = [
      'createMany',
      'createOne',
      'updateOne',
      'replaceOne',
    ];

    it.each(crudMethods)(
      '%s should use custom options',
      async (crudMethod: DoubleArg) => {
        const spy = jest.spyOn(JsxTypeOrmCrudService.prototype, crudMethod);

        let dto: Type<Thing> | CreateManyDto<Type<Thing>>;

        if (crudMethod === 'createMany') {
          dto = { bulk: [class extends Thing {}] };
          await ormService[crudMethod](mockRequest, dto, mockOverrides);
        } else {
          dto = class extends Thing {};
          await ormService[crudMethod](mockRequest, dto, mockOverrides);
        }

        expect(spy).toBeCalledTimes(1);

        expect(spy).toBeCalledWith(
          {
            options: { query: { alwaysPaginate: false } },
            parsed: {
              search: { $and: [{ name: 'apple' }, { name: 'pear' }] },
            },
          },
          dto,
        );
      },
    );
  });
});

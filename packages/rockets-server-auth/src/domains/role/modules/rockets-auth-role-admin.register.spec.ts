import { CrudModule } from '@concepta/nestjs-crud';
import { Operation } from '@concepta/nestjs-core';
import { afterEach, describe, it, expect, vi } from 'vitest';
import { RocketsAuthRoleAdminModule } from './rockets-auth-role-admin.module';
import { RocketsAuthRoleDto } from '../infrastructure/dto/rockets-auth-role.dto';

class ListHandler {}
class ReadHandler {}
class CreateHandler {}
class UpdateHandler {}
class DeleteHandler {}

afterEach(() => vi.restoreAllMocks());

describe('RocketsAuthRoleAdminModule.register', () => {
  it('builds CrudModule feature with paginated admin DTO', () => {
    const dynamic = RocketsAuthRoleAdminModule.register({
      imports: [],
      model: RocketsAuthRoleDto,
    });
    expect(dynamic.module).toBe(RocketsAuthRoleAdminModule);
    expect(Array.isArray(dynamic.imports)).toBe(true);
    expect((dynamic.imports ?? []).length).toBeGreaterThan(0);
  });

  it('forwards every route handler override to CrudModule', () => {
    const forFeature = vi.spyOn(CrudModule, 'forFeature');

    RocketsAuthRoleAdminModule.register({
      imports: [],
      model: RocketsAuthRoleDto,
      controller: {
        adminResource: {
          routes: {
            list: { handler: ListHandler },
            read: { handler: ReadHandler },
            create: { handler: CreateHandler },
            update: { handler: UpdateHandler },
            delete: { handler: DeleteHandler },
          },
        },
      },
    });

    expect(forFeature).toHaveBeenCalledOnce();
    const config = forFeature.mock.calls.at(-1)?.[0] as {
      crud: {
        operations: Array<{
          operation: Operation;
          queryHandler?: unknown;
          commandHandler?: unknown;
        }>;
      };
    };
    const operations = new Map(
      config.crud.operations.map((operation) => [
        operation.operation,
        operation,
      ]),
    );

    expect(operations.get(Operation.List)?.queryHandler).toBe(ListHandler);
    expect(operations.get(Operation.Read)?.queryHandler).toBe(ReadHandler);
    expect(operations.get(Operation.Create)?.commandHandler).toBe(
      CreateHandler,
    );
    expect(operations.get(Operation.Update)?.commandHandler).toBe(
      UpdateHandler,
    );
    expect(operations.get(Operation.Delete)?.commandHandler).toBe(
      DeleteHandler,
    );
  });
});

// TypeORM implementation of the zod layer's SchemaEntityCompiler
// contract. Bridges @concepta/rockets-core/zod (DB-agnostic schema → DTO /
// resource translation) to TypeORM entity classes. Apps wire it once:
//
//   import { bindZodResources } from '@concepta/rockets-core/zod';
//   import { typeOrmZodEntityCompiler } from '@concepta/rockets-repository-typeorm/zod';
//   export const { zodResource, zodSubResource } =
//     bindZodResources(typeOrmZodEntityCompiler);
export { compileEntity, typeOrmZodEntityCompiler } from './compile-entity';
export type { CompileEntityOptions } from './compile-entity';

import { Global, Module } from '@nestjs/common';

/**
 * No-op. `RepositoryModule.forRoot` already exports `TransactionScope`.
 * Drop this module once callers stop importing it.
 */
@Global()
@Module({})
export class ConceptaRepositoryCompatModule {}

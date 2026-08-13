import { randomUUID } from 'node:crypto';
import type { Provider } from '@nestjs/common';
import { getApp, getApps } from 'firebase-admin/app';
import {
  getDynamicRepositoryToken,
  type DynamicRepositoryModule,
} from '@concepta/nestjs-repository';

import { AdminFirestoreBackend } from '../backends/admin-firestore.backend';
import { FIRESTORE_DEFAULT_TRANSACTION_KEY } from '../constants/firestore-transaction.constants';
import { FirestoreRepositoryModule } from '../firestore-repository.module';
import type { FirestoreBackend } from '../interfaces/firestore-backend.interface';
import type { FirestoreProviderOptions } from '../interfaces/firestore-provider-options.interface';
import { buildFirestoreEntityMetadata } from '../repository/firestore-entity-metadata';
import { FirestoreRepository } from '../repository/firestore-repository';
import { FirestoreTransactionFactory } from '../transaction/firestore-transaction.factory';

type FirestoreTransactionFactoryDescriptor = NonNullable<
  DynamicRepositoryModule['transactionFactories']
>[number];

const backendTransactionKeys = new WeakMap<FirestoreBackend, string>();

/**
 * Stable per-backend transaction key. Identity is the backend instance
 * (WeakMap), and the suffix is a UUID assigned once — no process-global
 * counter, no boot-order-dependent numbering.
 */
export function resolveFirestoreTransactionKey(
  backend: FirestoreBackend,
): string {
  const existing = backendTransactionKeys.get(backend);
  if (existing !== undefined) {
    return existing;
  }
  const key = `${FIRESTORE_DEFAULT_TRANSACTION_KEY}:${randomUUID()}`;
  backendTransactionKeys.set(backend, key);
  return key;
}

export function resolveFirestoreBackend(
  backend?: FirestoreBackend,
): FirestoreBackend {
  if (backend) {
    return backend;
  }

  if (getApps().length === 0) {
    throw new Error(
      'Firestore: initialize Firebase Admin before RepositoryModule.forRoot ' +
        '(call ensureFirebaseAdminApp() or wire defineFirebaseAuth() in the app).',
    );
  }

  getApp();
  return new AdminFirestoreBackend();
}

export function createFirestoreProvider(
  options: FirestoreProviderOptions,
  backend: FirestoreBackend,
  transactionKey: string = resolveFirestoreTransactionKey(backend),
): Provider {
  const collection = options.collection ?? options.key;

  return {
    provide: getDynamicRepositoryToken(options.key),
    useFactory: () => {
      const metadata = buildFirestoreEntityMetadata(
        options.entity,
        collection,
        options.softDeleteField,
      );
      return new FirestoreRepository({
        entityKey: options.key,
        collection,
        metadata,
        backend,
        transactionKey,
      });
    },
  };
}

export function createFirestoreTransactionFactoryDescriptor(
  backend: FirestoreBackend,
  transactionKey: string = resolveFirestoreTransactionKey(backend),
): FirestoreTransactionFactoryDescriptor {
  return {
    key: transactionKey,
    inject: [],
    useFactory: () => new FirestoreTransactionFactory(backend),
  };
}

export function createFirestoreFeatureModule(
  entities: FirestoreProviderOptions[],
  backend?: FirestoreBackend,
): DynamicRepositoryModule {
  const resolvedBackend = resolveFirestoreBackend(backend);
  const transactionKey = resolveFirestoreTransactionKey(resolvedBackend);

  return {
    module: FirestoreRepositoryModule,
    providers: entities.map((entity) =>
      createFirestoreProvider(entity, resolvedBackend, transactionKey),
    ),
    exports: entities.map((entity) => getDynamicRepositoryToken(entity.key)),
    transactionFactories: [
      createFirestoreTransactionFactoryDescriptor(
        resolvedBackend,
        transactionKey,
      ),
    ],
  };
}

import {
  defineFirestoreRepository,
  InMemoryFirestoreBackend,
} from '@conceptadev/rockets-repository-firestore';

export const CODE_REVIEW_REPORT_COLLECTION = 'code_review_reports';

export const codeReviewReportsRepository = defineFirestoreRepository({
  backend: new InMemoryFirestoreBackend(),
});

/**
 * Enough to address one stored object and describe what it is —
 * intentionally NOT a full file entity. An app's own `create`/`read`
 * operation owns persistence (id, owner, timestamps); this is only what a
 * storage backend needs to mint a URL.
 */
export interface FileStorageDescriptor {
  /**
   * Object key / path within the storage backend. App-generated — this
   * seam does not invent a naming scheme.
   */
  readonly key: string;
  readonly mimeType: string;
  readonly size: number;
}

/**
 * Storage adapter seam for file upload/download (issue #86).
 *
 * The presigned-URL pattern, not inbound multipart parsing: an operation
 * built on this interface returns a URL the CLIENT uploads to (or
 * downloads from) directly — the storage backend, never this Nest app.
 * That is what makes the seam transport-agnostic for free. A
 * `multipart/form-data` body parsed IN the Nest process needs `multer` on
 * Express and a different library on Fastify; a JSON response carrying a
 * URL string needs neither, so the same operation works unmodified on
 * either adapter.
 *
 * Core ships no concrete implementation — no storage SDK is a core
 * dependency (same rule as `SchemaEntityCompiler` for the ORM). An app
 * provides one under {@link FILE_STORAGE_SERVICE_TOKEN}: S3
 * `getSignedUrl`, GCS `getSignedUrl`, or a local-dev equivalent. See
 * `CONFIGURATION.md` §6b for a worked `operationResource` example —
 * `create` validates size/mime-type against the declared input schema
 * BEFORE calling `getUploadUrl`, so an oversized or disallowed upload
 * never reaches the storage backend at all.
 */
export interface FileStorageServiceInterface {
  getUploadUrl(file: FileStorageDescriptor): Promise<string> | string;
  getDownloadUrl(file: FileStorageDescriptor): Promise<string> | string;
}

/** DI token for a {@link FileStorageServiceInterface} implementation. */
export const FILE_STORAGE_SERVICE_TOKEN = Symbol.for(
  '@concepta/rockets-core/file-storage-service',
);

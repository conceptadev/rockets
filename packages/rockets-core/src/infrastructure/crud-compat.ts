/**
 * Compat re-exports for nestjs-crud types that exist in the dist
 * but are not yet exported from the package index.
 *
 * Once upstream adds these to its index, remove this file and import from
 * nestjs-crud directly.
 */

export type {
  CrudParamOptionInterface,
  CrudRequestConfig,
  CrudResponseConfig,
} from '@concepta/nestjs-crud';

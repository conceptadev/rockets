export function getDynamicRepositoryToken(key: string) {
  return `TYPEORM_EXT_DYNAMIC_REPOSITORY_${key}`;
}

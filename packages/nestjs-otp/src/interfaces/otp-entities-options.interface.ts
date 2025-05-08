/**
 * OTP Entities Options Interface
 *
 * This interface defines the entity keys to be used in the OTP module.
 * The entity keys correspond to repositories that must be registered
 * via TypeOrmExtModule.forFeature() and imported.
 */
export interface OtpEntitiesOptionsInterface {
  /**
   * Array of entity keys that will be used to look up repositories
   * via getDynamicRepositoryToken()
   */
  entities: string[];
}

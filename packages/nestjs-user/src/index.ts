export { UserModule } from './user.module';
export { UserProfileCrudBuilder } from './utils/user-profile.crud-builder';

export { UserModelService } from './services/user-model.service';
export { UserPasswordService } from './services/user-password.service';
export { UserAccessQueryService } from './services/user-access-query.service';

export { UserModelServiceInterface } from './interfaces/user-model-service.interface';
export { UserPasswordServiceInterface } from './interfaces/user-password-service.interface';
export { UserEntitiesOptionsInterface } from './interfaces/user-entities-options.interface';

export { UserCreateManyDto } from './dto/user-create-many.dto';
export { UserCreateDto } from './dto/user-create.dto';
export { UserPaginatedDto } from './dto/user-paginated.dto';
export { UserPasswordDto } from './dto/user-password.dto';
export { UserPasswordUpdateDto } from './dto/user-password-update.dto';
export { UserPasswordHashDto } from './dto/user-password-hash.dto';
export { UserUpdateDto } from './dto/user-update.dto';
export { UserDto } from './dto/user.dto';

// Interfaces now in nestjs-common
// Entities moved to nestjs-typeorm-ext

export { UserProfileDto } from './dto/profile/user-profile.dto';
export { UserProfileCreateDto } from './dto/profile/user-profile-create.dto';
export { UserProfileUpdateDto } from './dto/profile/user-profile-update.dto';
export { UserProfilePaginatedDto } from './dto/profile/user-profile-paginated.dto';

export { UserResource } from './user.types';

export { UserException } from './exceptions/user-exception';
export { UserBadRequestException } from './exceptions/user-bad-request-exception';
export { UserNotFoundException } from './exceptions/user-not-found-exception';
export { UserMissingEntitiesOptionsException } from './exceptions/user-missing-entities-options.exception';

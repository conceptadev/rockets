import { DeepPartial, Repository } from 'typeorm';
import { Inject, Injectable, Type } from '@nestjs/common';
import {
  ReferenceLookupException,
  ReferenceMutateException,
  ReferenceValidationException,
} from '@concepta/typeorm-common';
import { EntityNotFoundException } from '../exceptions/entity-not-found.exception';
import { OtpAssigneeInterface } from '../interfaces/otp-assignee.interface';
import { OtpAssignmentInterface } from '../interfaces/otp-assignment.interface';
import { OtpInterface } from '../interfaces/otp.interface';
import { ALL_OTPS_REPOSITORIES_TOKEN } from '../otp.constants';
import { OtpCreateDto } from '../dto/otp-create.dto';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { OtpCreatableInterface } from '../interfaces/otp-creatable.interface';
import { randomUUID } from 'crypto';

@Injectable()
export class OtpService {
  constructor(
    @Inject(ALL_OTPS_REPOSITORIES_TOKEN)
    private allOtpRepos: Record<string, Repository<OtpAssignmentInterface>>,
  ) {}

  /**
   * Create a otp with a for the given assignee.
   * @param context The otp context (same as entity key)
   * @param data The data to create
   * @returns The object created
   */
  async create(
    context: string,
    data: OtpCreatableInterface,
  ): Promise<OtpCreateDto> {
    // get the assignment repo
    const assignmentRepo = this.getAssignmentRepo(context);

    // try to find the relationship
    try {
      // validate the data
      const dto = await this.validateDto<OtpCreateDto>(OtpCreateDto, data);
      const passCode = randomUUID();

      //TODO: should we validate if passCode already exists?

      // try to save the item
      return assignmentRepo.save({ ...dto, passCode });
    } catch (e) {
      throw new ReferenceMutateException(assignmentRepo.metadata.targetName, e);
    }
  }

  /**
   * Check if otp is valid
   *
   * @param context The otp context (same as entity key)
   * @param assignee  The assignee to check
   * @param category  The category to check
   * @param passCode The passCode to check
   * @param deleteIfValid If true, delete the otp if it is valid
   * @returns boolean
   */
  async isValid<T extends OtpAssigneeInterface>(
    context: string,
    assignee: Partial<T>,
    category: string,
    passCode: string,
    deleteIfValid: boolean,
  ): Promise<boolean> {
    // get otp from an assigned user for a category
    const assignedOtp = await this.getByPassCode(
      context,
      category,
      passCode,
      assignee,
    );

    // if is valid and deleteIfValid is true, delete the otp
    const isValid = !!assignedOtp;
    if (deleteIfValid && isValid) {
      await this.deleteOtp(context, assignedOtp.id);
    }

    return isValid;
  }

  /**
   * Delete a otp based on params
   * @param context The otp context (same as entity key)
   * @param assignee The assignee to check
   * @param category The category to check
   * @param passCode The passCode to check
   */
  async delete<T extends OtpAssigneeInterface>(
    context: string,
    assignee: Partial<T>,
    category: string,
    passCode: string,
  ): Promise<void> {
    // get otp from an assigned user for a category
    const assignedOtp = await this.getByPassCode(
      context,
      category,
      passCode,
      assignee,
    );

    if (assignedOtp) this.deleteOtp(context, assignedOtp.id);
  }

  /**
   * 
   * @param context The context of the repository (same as entity key)
   * @param assignee The assignee to delete
   * @param category The category to delete
   */
  //TODO: should i clear only based on one of the options?
  async clear<T extends OtpAssigneeInterface>(
    context: string,
    assignee: Partial<T>,
    category: string,
  ): Promise<void> {
    // get all otps from an assigned user for a category
    const assignedOtps = await this.getAssignedOtps(
      context,
      category,
      assignee,
    );

    // Map to get ids
    const assignedOtpIds = assignedOtps.map((assignedOtp) => assignedOtp.id);

    if (assignedOtpIds.length > 0)
      await this.deleteOtp(context, assignedOtpIds);
  }

  /**
   * Delete OTP based on context
   * @private
   * @param context The context to delete id from
   * @param id The id to delete
   */
  protected async deleteOtp(
    context: string,
    id: string | string[],
  ): Promise<void> {
    const repo = this.getAssignmentRepo(context);
    try {
      await repo.delete(id);
    } catch (e) {
      throw new ReferenceMutateException(repo.metadata.targetName, e);
    }
  }

  /**
   * Get all roles for assignee.
   *
   * @param context The context of the check (same as entity key)
   * @param assignee The assignee to check
   */
  protected async getAssignedOtps(
    context: string,
    category: string,
    assignee: Partial<OtpAssigneeInterface>,
  ): Promise<OtpInterface[]> {
    // get the assignment repo
    const assignmentRepo = this.getAssignmentRepo(context);

    // try to find the relationships
    try {
      // make the query
      const assignments = await assignmentRepo.find({
        where: {
          assignee,
          category,
        },
        relations: [context],
      });

      // return the otps from assignee
      return assignments;
    } catch (e) {
      throw new ReferenceLookupException(assignmentRepo.metadata.targetName, e);
    }
  }

  protected async getByPassCode(
    context: string,
    category: string,
    passCode: string,
    assignee: Partial<OtpAssigneeInterface>,
  ): Promise<OtpInterface | undefined> {
    // get the assignment repo
    const assignmentRepo = this.getAssignmentRepo(context);

    // try to find the relationships
    try {
      // make the query
      const assignments = await assignmentRepo.findOne({
        where: {
          assignee,
          category,
          passCode,
        },
        relations: [context],
      });

      // return the otps from assignee
      return assignments;
    } catch (e) {
      throw new ReferenceLookupException(assignmentRepo.metadata.targetName, e);
    }
  }

  /**
   * Get the assignment repo for the given context.
   *
   * @private
   * @param context The otp context (same as entity key)
   */
  protected getAssignmentRepo(
    context: string,
  ): Repository<OtpAssignmentInterface> {
    // repo matching context was injected?
    if (this.allOtpRepos[context]) {
      // yes, return it
      return this.allOtpRepos[context];
    } else {
      // bad context
      throw new EntityNotFoundException(context);
    }
  }

  // TODO: move to a separate service and reuse it on mutate service
  protected async validateDto<T extends DeepPartial<OtpInterface>>(
    type: Type<T>,
    data: T,
  ): Promise<T> {
    // convert to dto
    const dto = plainToInstance(type, data);

    // validate the data
    const validationErrors = await validate(dto);

    // any errors?
    if (validationErrors.length) {
      // yes, throw error
      throw new ReferenceValidationException(
        this.constructor.name,
        validationErrors,
      );
    }

    return dto;
  }
}

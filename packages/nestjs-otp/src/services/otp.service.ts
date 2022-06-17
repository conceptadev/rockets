import ms from 'ms';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { DeepPartial, Repository } from 'typeorm';
import { Inject, Injectable, Type } from '@nestjs/common';
import {
  ReferenceLookupException,
  ReferenceMutateException,
  ReferenceValidationException,
} from '@concepta/typeorm-common';
import { OtpTypeNotDefinedException } from '../exceptions/otp-type-not-defined.exception';
import { OtpAssigneeInterface } from '../interfaces/otp-assignee.interface';
import { OtpAssignmentInterface } from '../interfaces/otp-assignment.interface';
import { OtpInterface } from '../interfaces/otp.interface';
import {
  OTP_MODULE_REPOSITORIES_TOKEN,
  OTP_MODULE_SETTINGS_TOKEN,
} from '../otp.constants';
import { OtpCreateDto } from '../dto/otp-create.dto';
import { OtpCreatableInterface } from '../interfaces/otp-creatable.interface';
import { OtpSettingsInterface } from '../interfaces/otp-settings.interface';
import { EntityNotFoundException } from '../exceptions/entity-not-found.exception';
import { ReferenceIdInterface } from '@concepta/ts-core';

@Injectable()
export class OtpService {
  constructor(
    @Inject(OTP_MODULE_REPOSITORIES_TOKEN)
    private allOtpRepos: Record<string, Repository<OtpAssignmentInterface>>,
    @Inject(OTP_MODULE_SETTINGS_TOKEN)
    private settings: OtpSettingsInterface,
  ) {}

  /**
   * Create a otp with a for the given assignee.
   *
   * @param assignment The otp assignment
   * @param data The data to create
   */
  async create(
    assignment: string,
    data: OtpCreatableInterface,
  ): Promise<OtpCreateDto> {
    // get the assignment repo
    const assignmentRepo = this.getAssignmentRepo(assignment);

    // try to find the relationship
    try {
      // validate the data
      const dto = await this.validateDto<OtpCreateDto>(OtpCreateDto, data);

      if (!this.settings.types[data.type])
        throw new OtpTypeNotDefinedException(data.type);

      const passcode = this.settings.types[data.type].generator();

      const expirationDate = this.getExpirationDate(this.settings.expiresIn);

      // try to save the item
      return assignmentRepo.save({
        ...dto,
        passcode,
        expirationDate,
      });
    } catch (e) {
      throw new ReferenceMutateException(assignmentRepo.metadata.targetName, e);
    }
  }

  /**
   * Check if otp is valid
   *
   * @param assignment The otp assignment
   * @param assignee  The assignee to check
   * @param category  The category to check
   * @param passcode The passcode to check
   * @param deleteIfValid If true, delete the otp if it is valid
   */
  async isValid(
    assignment: string,
    assignee: ReferenceIdInterface,
    category: string,
    passcode: string,
    deleteIfValid = false,
  ): Promise<boolean> {
    // get otp from an assigned user for a category
    const assignedOtp = await this.getByPasscode(
      assignment,
      category,
      passcode,
      assignee,
    );

    // check if otp is expired
    const now = new Date();
    if (!assignedOtp || now > assignedOtp.expirationDate) return false;

    // determine if valid
    const isValid = !!assignedOtp;

    // if is valid and deleteIfValid is true, delete the otp
    if (isValid && deleteIfValid) {
      await this.deleteOtp(assignment, assignedOtp.id);
    }

    return isValid;
  }

  /**
   * Delete a otp based on params
   * @param assignment The otp assignment
   * @param assignee The assignee to check
   * @param category The category to check
   * @param passcode The passcode to check
   */
  async delete(
    assignment: string,
    assignee: ReferenceIdInterface,
    category: string,
    passcode: string,
  ): Promise<void> {
    // get otp from an assigned user for a category
    const assignedOtp = await this.getByPasscode(
      assignment,
      category,
      passcode,
      assignee,
    );

    if (assignedOtp) this.deleteOtp(assignment, assignedOtp.id);
  }

  /**
   * Clear all otps for assign in given category.
   *
   * @param assignment The assignment of the repository
   * @param assignee The assignee to delete
   * @param category The category to delete
   */
  async clear(
    assignment: string,
    assignee: ReferenceIdInterface,
    category: string,
  ): Promise<void> {
    // get all otps from an assigned user for a category
    const assignedOtps = await this.getAssignedOtps(
      assignment,
      category,
      assignee,
    );

    // Map to get ids
    const assignedOtpIds = assignedOtps.map((assignedOtp) => assignedOtp.id);

    if (assignedOtpIds.length > 0)
      await this.deleteOtp(assignment, assignedOtpIds);
  }

  /**
   * Delete OTP based on assignment
   *
   * @private
   * @param assignment The assignment to delete id from
   * @param id The id to delete
   */
  protected async deleteOtp(
    assignment: string,
    id: string | string[],
  ): Promise<void> {
    // get the assignment repo
    const repo = this.getAssignmentRepo(assignment);

    try {
      await repo.delete(id);
    } catch (e) {
      throw new ReferenceMutateException(repo.metadata.targetName, e);
    }
  }

  /**
   * Get all roles for assignee.
   *
   * @param assignment The assignment of the check
   * @param assignee The assignee to check
   */
  protected async getAssignedOtps(
    assignment: string,
    category: string,
    assignee: ReferenceIdInterface,
  ): Promise<OtpInterface[]> {
    // get the assignment repo
    const assignmentRepo = this.getAssignmentRepo(assignment);

    // try to find the relationships
    try {
      // make the query
      const assignments = await assignmentRepo.find({
        where: {
          assignee,
          category,
        },
        relations: ['assignee'],
      });

      // return the otps from assignee
      return assignments;
    } catch (e) {
      throw new ReferenceLookupException(assignmentRepo.metadata.targetName, e);
    }
  }

  protected async getByPasscode(
    assignment: string,
    category: string,
    passcode: string,
    assignee: ReferenceIdInterface,
  ): Promise<OtpInterface | undefined> {
    // get the assignment repo
    const assignmentRepo = this.getAssignmentRepo(assignment);

    // try to find the relationships
    try {
      // make the query
      const assignments = await assignmentRepo.findOne({
        where: {
          assignee,
          category,
          passcode,
        },
        relations: ['assignee'],
      });

      // return the otps from assignee
      return assignments;
    } catch (e) {
      throw new ReferenceLookupException(assignmentRepo.metadata.targetName, e);
    }
  }

  /**
   * Get the assignment repo for the given assignment.
   *
   * @private
   * @param assignment The otp assignment
   */
  protected getAssignmentRepo(
    assignment: string,
  ): Repository<OtpAssignmentInterface> {
    // repo matching assignment was injected?
    if (this.allOtpRepos[assignment]) {
      // yes, return it
      return this.allOtpRepos[assignment];
    } else {
      // bad assignment
      throw new EntityNotFoundException(assignment);
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

  // TODO: move this to a help function
  private getExpirationDate(expiresIn: string) {
    const now = new Date();

    // add time in seconds to now as string format
    return new Date(now.getTime() + ms(expiresIn));
  }
}

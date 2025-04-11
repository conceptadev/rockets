import ms from 'ms';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { DeepPartial, FindOptionsWhere, LessThanOrEqual } from 'typeorm';
import { Inject, Injectable, Type } from '@nestjs/common';
import {
  ReferenceAssigneeInterface,
  ReferenceAssignment,
  ReferenceId,
  OtpCreateParamsInterface,
  OtpValidateLimitParamsInterface,
} from '@concepta/nestjs-common';
import { OtpInterface } from '@concepta/nestjs-common';
import {
  ReferenceLookupException,
  ReferenceMutateException,
  ReferenceValidationException,
  RepositoryInterface,
} from '@concepta/typeorm-common';
import {
  OTP_MODULE_REPOSITORIES_TOKEN,
  OTP_MODULE_SETTINGS_TOKEN,
} from '../otp.constants';
import { OtpSettingsInterface } from '../interfaces/otp-settings.interface';
import { OtpServiceInterface } from '../interfaces/otp-service.interface';
import { OtpCreateDto } from '../dto/otp-create.dto';
import { OtpTypeNotDefinedException } from '../exceptions/otp-type-not-defined.exception';
import { OtpEntityNotFoundException } from '../exceptions/otp-entity-not-found.exception';
import { OtpLimitReachedException } from '../exceptions/otp-limit-reached.exception';

@Injectable()
export class OtpService implements OtpServiceInterface {
  constructor(
    @Inject(OTP_MODULE_REPOSITORIES_TOKEN)
    private allOtpRepos: Record<string, RepositoryInterface<OtpInterface>>,
    @Inject(OTP_MODULE_SETTINGS_TOKEN)
    protected readonly settings: OtpSettingsInterface,
  ) {}

  /**
   * Create a otp with a for the given assignee.
   *
   * @param params - The otp params
   */
  async create(params: OtpCreateParamsInterface): Promise<OtpInterface> {
    const { assignment, otp, clearOnCreate, rateSeconds, rateThreshold } =
      params;

    if (!this.settings.types[otp.type])
      throw new OtpTypeNotDefinedException(otp.type);

    // get the assignment repo
    const assignmentRepo = this.getAssignmentRepo(assignment);

    // validate the data
    const dto = await this.validateDto<OtpCreateDto>(OtpCreateDto, otp);

    // generate a passcode
    const passcode = this.settings.types[otp.type].generator();

    // break out the vars
    const { category, type, assignee, expiresIn } = dto;

    // check if amount of otp by time frame has been reached
    await this.validateOtpCreationLimit({
      assignment,
      assignee,
      category,
      rateSeconds,
      rateThreshold,
    });
    try {
      // generate the expiration date
      const expirationDate = this.getExpirationDate(expiresIn);

      // clear history if defined
      if (this.settings.keepHistoryDays && this.settings.keepHistoryDays > 0)
        this.clearHistory(assignment, otp);

      // if clearOnCreate was defined, use it, otherwise get default settings
      const shouldClear =
        clearOnCreate === true || clearOnCreate === false
          ? clearOnCreate
          : this.settings.clearOnCreate;

      if (shouldClear) {
        // this should make inactive instead of delete
        await this.inactivatePreviousOtp(assignment, dto);
      }

      return assignmentRepo.save({
        category,
        type,
        assignee,
        passcode,
        expirationDate,
        active: true,
      });
    } catch (e) {
      throw new ReferenceMutateException(assignmentRepo.metadata.targetName, {
        originalError: e,
      });
    }
  }

  private async validateOtpCreationLimit(
    params: OtpValidateLimitParamsInterface,
  ): Promise<void> {
    const { assignment, assignee, category, rateSeconds, rateThreshold } =
      params;

    // check if validation config should be overridden
    const finalRateSeconds =
      rateSeconds && rateSeconds >= 0 ? rateSeconds : this.settings.rateSeconds;
    const finalOtpLimit =
      rateThreshold && rateThreshold >= 0
        ? rateThreshold
        : this.settings.rateThreshold;

    // only check if it was defined
    if (finalRateSeconds && finalOtpLimit) {
      const cutoffDate = new Date();
      cutoffDate.setSeconds(cutoffDate.getSeconds() - finalRateSeconds);

      // get all active and inactive
      const recentOtps = await this.getAssignedOtps(assignment, {
        assignee,
        category,
      });

      // get otp in the time frame
      const recentOtpCount = recentOtps.filter(
        (otp) => otp.dateCreated > cutoffDate,
      ).length;

      if (recentOtpCount >= finalOtpLimit) {
        throw new OtpLimitReachedException();
      }
    }
  }

  /**
   * Check if otp is valid
   *
   * @param assignment - The otp assignment
   * @param otp - The otp to validate
   * @param deleteIfValid - If true, delete the otp if it is valid
   */
  async validate(
    assignment: ReferenceAssignment,
    otp: Pick<OtpInterface, 'category' | 'passcode'>,
    deleteIfValid = false,
  ): Promise<ReferenceAssigneeInterface | null> {
    // get otp from an assigned user for a category
    const assignedOtp = await this.getActiveByPasscode(assignment, {
      ...otp,
      active: true,
    });

    // check if otp is expired
    const now = new Date();
    if (!assignedOtp || now > assignedOtp.expirationDate) return null;

    // determine if valid
    const isValid = !!assignedOtp;

    // if is valid and deleteIfValid is true, delete the otp
    if (isValid && deleteIfValid) {
      await this.deleteOtp(assignment, assignedOtp.id);
    }

    return assignedOtp;
  }

  /**
   * Delete a otp based on params
   *
   * @param assignment - The otp assignment
   * @param otp - The otp to delete
   */
  async delete(
    assignment: ReferenceAssignment,
    otp: Pick<OtpInterface, 'assignee' | 'category' | 'passcode'>,
  ): Promise<void> {
    // get otp from an assigned user for a category
    const assignedOtp = await this.getByPasscode(assignment, otp);

    if (assignedOtp) {
      this.deleteOtp(assignment, assignedOtp.id);
    }
  }

  /**
   * Clear all otps for assign in given category.
   *
   * @param assignment - The assignment of the repository
   * @param otp - The otp to clear
   */
  async clear(
    assignment: ReferenceAssignment,
    otp: Pick<OtpInterface, 'assignee' | 'category'>,
  ): Promise<void> {
    // get all otps from an assigned user for a category
    const assignedOtps = await this.getAssignedOtps(assignment, otp);

    // Map to get ids
    const assignedOtpIds = assignedOtps.map((assignedOtp) => assignedOtp.id);

    if (assignedOtpIds.length > 0)
      await this.deleteOtp(assignment, assignedOtpIds);
  }

  /**
   * Delete OTP based on assignment
   *
   * @internal
   * @param assignment - The assignment to delete id from
   * @param id - The id or ids to delete
   */
  protected async deleteOtp(
    assignment: ReferenceAssignment,
    id: ReferenceId | ReferenceId[],
  ): Promise<void> {
    // get the assignment repo
    const assignmentRepo = this.getAssignmentRepo(assignment);

    try {
      await assignmentRepo.delete(id);
    } catch (e) {
      throw new ReferenceMutateException(assignmentRepo.metadata.targetName, {
        originalError: e,
      });
    }
  }

  async clearHistory(
    assignment: ReferenceAssignment,
    otp: Pick<OtpInterface, 'assignee' | 'category'>,
  ): Promise<void> {
    const keepHistoryDays = this.settings.keepHistoryDays;
    // get only otps based on date for history days
    const assignedOtps = await this.getAssignedOtps(
      assignment,
      otp,
      keepHistoryDays,
    );

    // Map to get ids
    const assignedOtpIds = assignedOtps.map((assignedOtp) => assignedOtp.id);

    if (assignedOtpIds.length > 0)
      await this.deleteOtp(assignment, assignedOtpIds);
  }

  /**
   * Get all OTPs for assignee. of filtered by date based on keep history days
   *
   * @param assignment - The assignment of the check
   * @param otp - The otp to get assignments
   */
  // TODO: recieve query in parameters
  protected async getAssignedOtps(
    assignment: ReferenceAssignment,
    otp: Pick<OtpInterface, 'assignee' | 'category'>,
    keepHistoryDays?: number,
  ): Promise<OtpInterface[]> {
    // get the assignment repo
    const assignmentRepo = this.getAssignmentRepo(assignment);

    // break out the args
    const { assignee, category } = otp;

    // try to find the relationships
    try {
      // simple query or query by date from history
      const query:
        | FindOptionsWhere<OtpInterface>[]
        | FindOptionsWhere<OtpInterface> = this.buildFindQuery(
        assignee.id,
        category,
        keepHistoryDays,
      );

      // make the query
      const assignments = await assignmentRepo.find({
        where: query,
        relations: ['assignee'],
      });

      // return the otps from assignee
      return assignments;
    } catch (e) {
      throw new ReferenceLookupException(assignmentRepo.metadata.targetName, {
        originalError: e,
      });
    }
  }

  private buildFindQuery(
    assigneeId: string,
    category: string,
    keepHistoryDays?: number,
  ) {
    let query:
      | FindOptionsWhere<OtpInterface>[]
      | FindOptionsWhere<OtpInterface> = {
      assignee: { id: assigneeId },
      category,
    };
    // filter by date
    if (keepHistoryDays) {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - keepHistoryDays);
      query = {
        assignee: { id: assigneeId },
        category,
        dateCreated: LessThanOrEqual(cutoffDate),
      };
    }
    return query;
  }
  protected async getByPasscode(
    assignment: ReferenceAssignment,
    otp: Pick<OtpInterface, 'category' | 'passcode'>,
  ): Promise<OtpInterface | null> {
    // break out properties
    const { category, passcode } = otp;

    // get the assignment repo
    const assignmentRepo = this.getAssignmentRepo(assignment);

    // try to find the assignment
    try {
      // make the query
      const assignment = await assignmentRepo.findOne({
        where: {
          category,
          passcode,
        },
        relations: ['assignee'],
      });

      // return the otps from assignee
      return assignment;
    } catch (e) {
      throw new ReferenceLookupException(assignmentRepo.metadata.targetName, {
        originalError: e,
      });
    }
  }

  protected async getActiveByPasscode(
    assignment: ReferenceAssignment,
    otp: Pick<OtpInterface, 'category' | 'passcode' | 'active'>,
  ): Promise<OtpInterface | null> {
    // break out properties
    const { category, passcode, active } = otp;

    // get the assignment repo
    const assignmentRepo = this.getAssignmentRepo(assignment);

    // try to find the assignment
    try {
      // make the query
      const assignment = await assignmentRepo.findOne({
        where: {
          category,
          passcode,
          active,
        },
        relations: ['assignee'],
      });

      // return the otps from assignee
      return assignment;
    } catch (e) {
      throw new ReferenceLookupException(assignmentRepo.metadata.targetName, {
        originalError: e,
      });
    }
  }

  /**
   * Get the assignment repo for the given assignment.
   *
   * @internal
   * @param assignment - The otp assignment
   */
  protected getAssignmentRepo(
    assignment: ReferenceAssignment,
  ): RepositoryInterface<OtpInterface> {
    // repo matching assignment was injected?
    if (this.allOtpRepos[assignment]) {
      // yes, return it
      return this.allOtpRepos[assignment];
    } else {
      // bad assignment
      throw new OtpEntityNotFoundException(assignment);
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

  protected async inactivatePreviousOtp(
    assignment: ReferenceAssignment,
    otp: Pick<OtpInterface, 'assignee' | 'category'>,
  ): Promise<void> {
    // get the assignment repo
    const assignmentRepo = this.getAssignmentRepo(assignment);

    // break out the args
    const { assignee, category } = otp;

    // try to find the relationships
    try {
      // TODO: TYPEORM REMOVE UPDATE REPLACE FOR SAVE
      // make previous inactive
      await assignmentRepo.update(
        {
          assignee: { id: assignee.id },
          category,
        },
        {
          active: false,
        },
      );
    } catch (e) {
      throw new ReferenceLookupException(assignmentRepo.metadata.targetName, {
        originalError: e,
      });
    }
  }

  // TODO: move this to a help function
  private getExpirationDate(expiresIn: string) {
    const now = new Date();

    // add time in seconds to now as string format
    return new Date(now.getTime() + ms(expiresIn));
  }
}

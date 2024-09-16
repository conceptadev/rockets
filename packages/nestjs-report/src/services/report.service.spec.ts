import { randomUUID } from 'crypto';
import { mock } from 'jest-mock-extended';
import { Repository } from 'typeorm';
import {
  ReportCreatableInterface,
  ReportStatusEnum,
} from '@concepta/ts-common';
import { ReportCreateDto } from '../dto/report-create.dto';
import { ReportDuplicateEntryException } from '../exceptions/report-duplicated.exception';
import { ReportQueryException } from '../exceptions/report-query.exception';
import { ReportEntityInterface } from '../interfaces/report-entity.interface';
import { ReportStrategyService } from './report-strategy.service';
import { ReportService } from './report.service';

const mockReport: ReportEntityInterface = {
  id: randomUUID(),
  serviceKey: 'test-service',
  name: 'test.txt',
  status: ReportStatusEnum.Complete,
  errorMessage: null,
  downloadUrl: 'https://download.url',
  dateCreated: new Date(),
  dateUpdated: new Date(),
  dateDeleted: new Date(),
  version: 1,
};

const mockReportCreateDto: ReportCreateDto = {
  serviceKey: mockReport.serviceKey,
  name: mockReport.name,
};

describe(ReportService.name, () => {
  let reportService: ReportService;
  let reportRepo: jest.Mocked<Repository<ReportEntityInterface>>;
  let reportStrategyService: jest.Mocked<ReportStrategyService>;

  beforeEach(() => {
    reportRepo = createMockRepository();
    reportStrategyService = createMockReportStrategyService();
    reportService = new ReportService(reportRepo, reportStrategyService);
    reportRepo.create.mockReturnValue(mockReport);
    const mockTransactionalEntityManager = {
      findOne: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockReturnValue(mockReport),
      save: jest.fn().mockResolvedValue(mockReport),
    };

    reportRepo.manager.transaction = jest
      .fn()
      .mockImplementation(async (cb) => {
        return await cb(mockTransactionalEntityManager);
      });
  });

  describe('generate', () => {
    it('should create a new report', async () => {
      reportStrategyService.generate.mockImplementationOnce(
        (_report: ReportCreatableInterface) => {
          return Promise.resolve(mockReport);
        },
      );
      jest
        .spyOn(reportRepo, 'findOne')
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(mockReport);
      jest.spyOn(reportService, 'done');

      const result = await reportService.generate(mockReportCreateDto);
      expect(reportStrategyService.generate).toHaveBeenCalledWith(mockReport);
      expect(reportService.done).toHaveBeenCalledWith(mockReport);
      expect(result.id).toBe(mockReport.id);
    });
    it('should report be with error', async () => {
      reportStrategyService.generate.mockImplementationOnce(
        (_report: ReportCreatableInterface) => {
          throw new Error('Error generating report');
        },
      );
      jest
        .spyOn(reportRepo, 'findOne')
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(mockReport);
      const doneSpy = jest.spyOn(reportService, 'done');

      const result = await reportService.generate(mockReportCreateDto);
      expect(reportStrategyService.generate).toHaveBeenCalledWith(mockReport);
      expect(doneSpy).toHaveBeenCalledWith({
        id: mockReport.id,
        status: ReportStatusEnum.Error,
        errorMessage: 'Error generating report',
      });
      expect(result.id).toBe(mockReport.id);
    });
    it('should throw excetion', async () => {
      reportStrategyService.generate.mockImplementationOnce(
        (_report: ReportCreatableInterface) => {
          return Promise.resolve(mockReport);
        },
      );
      jest.spyOn(reportRepo, 'findOne').mockResolvedValueOnce(mockReport);
      jest.spyOn(reportService, 'done');

      await expect(reportService.generate(mockReportCreateDto)).rejects.toThrow(
        ReportDuplicateEntryException,
      );
    });
  });

  describe('fetch', () => {
    it('should return report', async () => {
      reportRepo.findOne.mockResolvedValue(mockReport);
      reportStrategyService.getDownloadUrl.mockImplementationOnce(
        (_report: ReportCreatableInterface) => {
          return Promise.resolve(mockReport.downloadUrl || '');
        },
      );
      jest.spyOn(reportRepo, 'findOne').mockResolvedValueOnce(mockReport);

      const result = await reportService.fetch({ id: mockReport.id });

      expect(reportRepo.findOne).toHaveBeenCalledWith({
        where: { id: mockReport.id },
        relations: ['file'],
      });
      expect(result.downloadUrl).toBe(mockReport.downloadUrl);
    });

    it('should return download URL for existing report', async () => {
      const reportWithFile = {
        ...mockReport,
        file: {
          id: randomUUID(),
        },
      };
      reportRepo.findOne.mockResolvedValue(reportWithFile);
      reportStrategyService.getDownloadUrl.mockImplementationOnce(
        (_report: ReportCreatableInterface) => {
          return Promise.resolve(reportWithFile.downloadUrl || '');
        },
      );
      jest.spyOn(reportRepo, 'findOne').mockResolvedValueOnce(reportWithFile);

      const result = await reportService.fetch({ id: mockReport.id });

      expect(reportRepo.findOne).toHaveBeenCalledWith({
        where: { id: reportWithFile.id },
        relations: ['file'],
      });
      expect(reportStrategyService.getDownloadUrl).toHaveBeenCalledWith(
        reportWithFile,
      );
      expect(result.downloadUrl).toBe(reportWithFile.downloadUrl);
    });

    it('should throw ReportQueryException if report not found', async () => {
      reportRepo.findOne.mockResolvedValue(null);

      await expect(reportService.fetch({ id: mockReport.id })).rejects.toThrow(
        ReportQueryException,
      );
      expect(reportRepo.findOne).toHaveBeenCalledWith({
        where: { id: mockReport.id },
        relations: ['file'],
      });
    });
  });
});

function createMockRepository(): jest.Mocked<
  Repository<ReportEntityInterface>
> {
  return mock<Repository<ReportEntityInterface>>({
    findOne: jest.fn().mockResolvedValue(mockReport),
    create: jest.fn().mockReturnValue(mockReport),
    save: jest.fn().mockResolvedValue(mockReport),
  });
}

function createMockReportStrategyService(): jest.Mocked<ReportStrategyService> {
  return mock<ReportStrategyService>({
    generate: jest.fn().mockResolvedValue(mockReport),
  });
}

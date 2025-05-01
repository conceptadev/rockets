import { Test, TestingModule } from '@nestjs/testing';
import { InvitationAttemptService } from './invitation-attempt.service';
import { InvitationAcceptanceService } from './invitation-acceptance.service';
import { InvitationSendService } from './invitation-send.service';
import { InvitationNotFoundException } from '../exceptions/invitation-not-found.exception';
import { InvitationInterface } from '@concepta/nestjs-common';

describe('InvitationAttemptService', () => {
  let service: InvitationAttemptService;
  let invitationAcceptanceService: jest.Mocked<InvitationAcceptanceService>;
  let invitationSendService: jest.Mocked<InvitationSendService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InvitationAttemptService,
        {
          provide: InvitationAcceptanceService,
          useValue: {
            getOneByCode: jest.fn(),
          },
        },
        {
          provide: InvitationSendService,
          useValue: {
            send: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<InvitationAttemptService>(InvitationAttemptService);
    invitationAcceptanceService = module.get(InvitationAcceptanceService);
    invitationSendService = module.get(InvitationSendService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('send', () => {
    it('should successfully send an invitation', async () => {
      const mockInvitation = {
        id: 'test-id',
        userId: 'test-user-id',
        code: 'test-code',
        category: 'test-category',
        active: true,
        constraints: {},
        dateCreated: new Date(),
        dateUpdated: new Date(),
        dateDeleted: null,
      } as InvitationInterface;

      invitationAcceptanceService.getOneByCode.mockResolvedValue(
        mockInvitation,
      );
      invitationSendService.send.mockResolvedValue(undefined);

      await service.send('test-code');

      expect(invitationAcceptanceService.getOneByCode).toHaveBeenCalledWith(
        'test-code',
      );
      expect(invitationSendService.send).toHaveBeenCalledWith({
        id: 'test-id',
        userId: 'test-user-id',
        code: 'test-code',
        category: 'test-category',
      });
    });

    it('should throw InvitationNotFoundException when invitation is not found', async () => {
      invitationAcceptanceService.getOneByCode.mockResolvedValue(null);

      await expect(service.send('invalid-code')).rejects.toThrow(
        InvitationNotFoundException,
      );
      expect(invitationAcceptanceService.getOneByCode).toHaveBeenCalledWith(
        'invalid-code',
      );
      expect(invitationSendService.send).not.toHaveBeenCalled();
    });

    it('should throw InvitationNotFoundException when getOneByCode throws an error', async () => {
      invitationAcceptanceService.getOneByCode.mockRejectedValue(
        new Error('Test error'),
      );

      await expect(service.send('test-code')).rejects.toThrow(
        InvitationNotFoundException,
      );
      expect(invitationAcceptanceService.getOneByCode).toHaveBeenCalledWith(
        'test-code',
      );
      expect(invitationSendService.send).not.toHaveBeenCalled();
    });
  });
});

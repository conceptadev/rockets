import { Test, TestingModule } from '@nestjs/testing';
import { InvitationService } from './invitation.service';
import { InvitationSendService } from './invitation-send.service';
import { InvitationAcceptanceService } from './invitation-acceptance.service';
import { InvitationRevocationService } from './invitation-revocation.service';
import { InvitationInterface } from '@concepta/nestjs-common';
import { InvitationCreateInviteInterface } from '../interfaces/domain/invitation-create-invite.interface';
import { InvitationAcceptOptionsInterface } from '../interfaces/options/invitation-accept-options.interface';
import { InvitationRevokeOptionsInterface } from '../interfaces/options/invitation-revoke-options.interface';

describe(InvitationService.name, () => {
  let service: InvitationService;
  let invitationSendService: jest.Mocked<InvitationSendService>;
  let invitationAcceptanceService: jest.Mocked<InvitationAcceptanceService>;
  let invitationRevocationService: jest.Mocked<InvitationRevocationService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InvitationService,
        {
          provide: InvitationSendService,
          useValue: {
            create: jest.fn(),
            send: jest.fn(),
          },
        },
        {
          provide: InvitationAcceptanceService,
          useValue: {
            accept: jest.fn(),
          },
        },
        {
          provide: InvitationRevocationService,
          useValue: {
            revokeAll: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<InvitationService>(InvitationService);
    invitationSendService = module.get(InvitationSendService);
    invitationAcceptanceService = module.get(InvitationAcceptanceService);
    invitationRevocationService = module.get(InvitationRevocationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe(InvitationService.prototype.create.name, () => {
    it('should create an invitation using the send service', async () => {
      // Arrange
      const createInviteDto: InvitationCreateInviteInterface = {
        email: 'test@example.com',
        category: 'test-category',
      };
      const expectedInvitation = { id: '123' } as InvitationInterface;
      invitationSendService.create.mockResolvedValue(expectedInvitation);

      // Act
      const result = await service.create(createInviteDto);

      // Assert
      expect(invitationSendService.create).toHaveBeenCalledWith(
        createInviteDto,
      );
      expect(result).toBe(expectedInvitation);
    });
  });

  describe(InvitationService.prototype.send.name, () => {
    it('should send an invitation using the send service', async () => {
      // Arrange
      const invitation = { id: '123' } as Pick<InvitationInterface, 'id'>;
      invitationSendService.send.mockResolvedValue(undefined);

      // Act
      await service.send(invitation);

      // Assert
      expect(invitationSendService.send).toHaveBeenCalledWith(invitation);
    });
  });

  describe(InvitationService.prototype.accept.name, () => {
    it('should accept an invitation using the acceptance service', async () => {
      // Arrange
      const options: InvitationAcceptOptionsInterface = {
        code: '123456',
        passcode: '123456',
      };
      const expectedResult = true;
      invitationAcceptanceService.accept.mockResolvedValue(expectedResult);

      // Act
      const result = await service.accept(options);

      // Assert
      expect(invitationAcceptanceService.accept).toHaveBeenCalledWith(options);
      expect(result).toBe(expectedResult);
    });
  });

  describe(InvitationService.prototype.revokeAll.name, () => {
    it('should revoke all invitations using the revocation service', async () => {
      // Arrange
      const options: InvitationRevokeOptionsInterface = {
        email: 'test@example.com',
        category: 'test-category',
      };
      invitationRevocationService.revokeAll.mockResolvedValue(undefined);

      // Act
      await service.revokeAll(options);

      // Assert
      expect(invitationRevocationService.revokeAll).toHaveBeenCalledWith(
        options,
      );
    });
  });
});

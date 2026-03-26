import { Controller, Post, Body, Logger } from '@nestjs/common';
import { EventsGateway } from '../events/events.gateway';

@Controller('broadcast')
export class BroadcastController {
  private readonly logger = new Logger(BroadcastController.name);

  constructor(private eventsGateway: EventsGateway) {}

  @Post('credential-issued')
  handleCredentialIssued(
    @Body() body: {
      studentId: string;
      credentialId: string;
      name?: string;
      degreeTitle?: string;
      status?: string;
      txHash?: string;
      tokenId?: string;
    },
  ) {
    this.logger.log(`Broadcasting credential:issued for student=${body.studentId}`);
    this.eventsGateway.emitCredentialIssued(body.studentId, {
      event: 'CredentialIssued',
      credentialId: body.credentialId,
      studentId: body.studentId,
      degreeTitle: body.degreeTitle || body.name || '',
      status: body.status || 'issued',
      txHash: body.txHash || '',
      tokenId: body.tokenId || '',
      recipient: '',
      studentName: '',
      ipfsCID: '',
      documentHash: '',
    });
    return { success: true };
  }

  @Post('credential-status-changed')
  handleCredentialStatusChanged(
    @Body() body: { credentialId: string; status: string },
  ) {
    this.logger.log(`Broadcasting credential:statusChanged id=${body.credentialId} status=${body.status}`);
    this.eventsGateway.emitCredentialStatusChanged(body.credentialId, body.status);
    return { success: true };
  }

  @Post('tx-confirmed')
  handleTxConfirmed(
    @Body() body: { credentialId: string; txHash: string; tokenId: string },
  ) {
    this.logger.log(`Broadcasting credential:txConfirmed id=${body.credentialId}`);
    this.eventsGateway.emitTxConfirmed(body.credentialId, body.txHash, body.tokenId);
    return { success: true };
  }

  @Post('registration-updated')
  handleRegistrationUpdated(
    @Body() body: { requestId: string; type: string; name: string; status: string },
  ) {
    this.logger.log(`Broadcasting registration:updated ${body.name} (${body.type}) -> ${body.status}`);
    this.eventsGateway.emitRegistrationUpdated(body);
    return { success: true };
  }
}

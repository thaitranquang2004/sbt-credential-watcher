import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3001',
    credentials: true,
  },
})
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('join:student')
  handleJoinStudent(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { studentId: string },
  ) {
    client.join(`student:${data.studentId}`);
    return { event: 'joined', data: `student:${data.studentId}` };
  }

  emitCredentialIssued(studentId: string, credential: any) {
    this.server.to(`student:${studentId}`).emit('credential:issued', credential);
  }

  emitCredentialStatusChanged(credentialId: string, status: string) {
    this.server.emit('credential:statusChanged', { credentialId, status });
  }

  emitTxConfirmed(credentialId: string, txHash: string, tokenId: string) {
    this.server.emit('credential:txConfirmed', { credentialId, txHash, tokenId });
  }
}

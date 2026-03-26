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
    console.log(`Client ${client.id} joined room student:${data.studentId}`);
    return { event: 'joined', data: `student:${data.studentId}` };
  }

  @SubscribeMessage('join:school')
  handleJoinSchool(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { schoolId: string },
  ) {
    client.join(`school:${data.schoolId}`);
    console.log(`Client ${client.id} joined room school:${data.schoolId}`);
    return { event: 'joined', data: `school:${data.schoolId}` };
  }

  @SubscribeMessage('join:admin')
  handleJoinAdmin(
    @ConnectedSocket() client: Socket,
  ) {
    client.join('admin');
    console.log(`Client ${client.id} joined room admin`);
    return { event: 'joined', data: 'admin' };
  }

  // Credential issued - send to student room + broadcast to all
  emitCredentialIssued(studentId: string, credential: any) {
    this.server.to(`student:${studentId}`).emit('credential:issued', credential);
    // Also broadcast to all (for school/admin pages)
    this.server.emit('credential:issued', credential);
  }

  // Status changed - broadcast to all
  emitCredentialStatusChanged(credentialId: string, status: string) {
    this.server.emit('credential:statusChanged', { credentialId, status });
  }

  // Tx confirmed - broadcast to all
  emitTxConfirmed(credentialId: string, txHash: string, tokenId: string) {
    this.server.emit('credential:txConfirmed', { credentialId, txHash, tokenId });
  }

  // Registration updated - broadcast to admin
  emitRegistrationUpdated(data: { requestId: string; type: string; name: string; status: string }) {
    this.server.to('admin').emit('registration:updated', data);
    this.server.emit('registration:updated', data);
  }
}

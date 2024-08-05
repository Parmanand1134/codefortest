import { WebSocketGateway, WebSocketServer, SubscribeMessage, OnGatewayConnection, OnGatewayDisconnect, MessageBody, ConnectedSocket } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway()
export class AppGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('joinRoom')
  handleJoinRoom(@ConnectedSocket() client: Socket, @MessageBody() room: string) {
    client.join(room);
    client.to(room).emit('message', `User ${client.id} has joined the room ${room}`);
    console.log(`Client ${client.id} joined room: ${room}`);
  }

  @SubscribeMessage('leaveRoom')
  handleLeaveRoom(@ConnectedSocket() client: Socket, @MessageBody() room: string) {
    client.leave(room);
    client.to(room).emit('message', `User ${client.id} has left the room ${room}`);
    console.log(`Client ${client.id} left room: ${room}`);
  }

  @SubscribeMessage('broadcastMessage')
  handleBroadcastMessage(@ConnectedSocket() client: Socket, @MessageBody() payload: { room: string, message: string }) {
    const { room, message } = payload;
    this.server.to(room).emit('message', message);
    console.log(`Message broadcasted to room ${room}: ${message}`);
  }
}

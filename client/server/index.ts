import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
import { Server as SocketIOServer } from 'socket.io';
import express from 'express';
import { Filter } from 'bad-words';
import { addUser, removeUser, getUser, getUsersInRoom } from './utils/users';
import { generateMessage, generateLocationMessage } from './utils/messages';

// Types for Socket.IO
interface User {
  id: string;
  username: string;
  room: string;
}

interface Message {
  id: string;
  username: string;
  text: string;
  createdAt: number;
  type: 'text' | 'location' | 'system' | 'bot';
  url?: string;
}

interface RoomData {
  room: string;
  users: User[];
}

interface JoinPayload {
  username: string;
  room: string;
}

interface ServerToClientEvents {
  message: (message: Message) => void;
  locationMessage: (message: Message) => void;
  roomData: (data: RoomData) => void;
}

interface ClientToServerEvents {
  join: (payload: JoinPayload, callback: (error?: string) => void) => void;
  sendMessage: (message: string, callback: (error?: string) => void) => void;
  sendLocation: (coords: { latitude: number; longitude: number }, callback: () => void) => void;
}

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = parseInt(process.env.PORT || '3000', 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

const filter = new Filter();

app.prepare().then(() => {
  const expressApp = express();
  const httpServer = createServer(expressApp);

  const io = new SocketIOServer<ClientToServerEvents, ServerToClientEvents>(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    console.log('New WebSocket connection');

    socket.on('join', ({ username, room }, callback) => {
      const { error, user } = addUser({ id: socket.id, username, room });

      if (error) {
        return callback(error);
      }

      if (!user) {
        return callback('Failed to join room');
      }

      socket.join(user.room);

      // Welcome message to the user
      socket.emit('message', generateMessage('Admin', `Welcome to ${user.room}!`, 'system'));

      // Broadcast to others in the room
      socket.broadcast
        .to(user.room)
        .emit('message', generateMessage('Admin', `${user.username} has joined!`, 'system'));

      // Send room data to all users
      io.to(user.room).emit('roomData', {
        room: user.room,
        users: getUsersInRoom(user.room),
      });

      callback();
    });

    socket.on('sendMessage', (message, callback) => {
      const user = getUser(socket.id);

      if (!user) {
        return callback('User not found');
      }

      // Check for profanity
      if (filter.isProfane(message)) {
        return callback('Profanity is not allowed!');
      }

      io.to(user.room).emit('message', generateMessage(user.username, message, 'text'));
      callback();
    });

    socket.on('sendLocation', (coords, callback) => {
      const user = getUser(socket.id);

      if (!user) {
        return callback();
      }

      io.to(user.room).emit(
        'locationMessage',
        generateLocationMessage(user.username, coords.latitude, coords.longitude)
      );

      callback();
    });

    socket.on('disconnect', () => {
      const user = removeUser(socket.id);

      if (user) {
        io.to(user.room).emit(
          'message',
          generateMessage('Admin', `${user.username} has left!`, 'system')
        );

        io.to(user.room).emit('roomData', {
          room: user.room,
          users: getUsersInRoom(user.room),
        });
      }
    });
  });

  // Handle all Next.js requests
  expressApp.all('/{*path}', (req, res) => {
    const parsedUrl = parse(req.url!, true);
    handle(req, res, parsedUrl);
  });

  httpServer.listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port}`);
  });
});

'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import type { Message, RoomData, ServerToClientEvents, ClientToServerEvents } from '@/types';

interface SocketContextType {
  socket: Socket<ServerToClientEvents, ClientToServerEvents> | null;
  isConnected: boolean;
  messages: Message[];
  users: RoomData['users'];
  room: string | null;
  username: string | null;
  error: string | null;
  joinRoom: (username: string, room: string) => Promise<void>;
  sendMessage: (message: string) => Promise<void>;
  sendLocation: () => Promise<void>;
  addLocalMessage: (message: Message) => void;
  disconnect: () => void;
}

const SocketContext = createContext<SocketContextType | null>(null);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

interface SocketProviderProps {
  children: React.ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<Socket<ServerToClientEvents, ClientToServerEvents> | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [users, setUsers] = useState<RoomData['users']>([]);
  const [room, setRoom] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const newSocket: Socket<ServerToClientEvents, ClientToServerEvents> = io({
      autoConnect: false,
    });

    newSocket.on('connect', () => {
      setIsConnected(true);
      setError(null);
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
    });

    newSocket.on('message', (message: Message) => {
      setMessages((prev) => [...prev, message]);
    });

    newSocket.on('locationMessage', (message: Message) => {
      setMessages((prev) => [...prev, message]);
    });

    newSocket.on('roomData', (data: RoomData) => {
      setRoom(data.room);
      setUsers(data.users);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  const joinRoom = useCallback(
    async (newUsername: string, newRoom: string): Promise<void> => {
      return new Promise((resolve, reject) => {
        if (!socket) {
          reject(new Error('Socket not initialized'));
          return;
        }

        socket.connect();

        socket.emit('join', { username: newUsername, room: newRoom }, (error?: string) => {
          if (error) {
            setError(error);
            socket.disconnect();
            reject(new Error(error));
          } else {
            setUsername(newUsername);
            setRoom(newRoom);
            setMessages([]);
            resolve();
          }
        });
      });
    },
    [socket]
  );

  const sendMessage = useCallback(
    async (message: string): Promise<void> => {
      return new Promise((resolve, reject) => {
        if (!socket || !isConnected) {
          reject(new Error('Not connected'));
          return;
        }

        socket.emit('sendMessage', message, (error?: string) => {
          if (error) {
            setError(error);
            reject(new Error(error));
          } else {
            resolve();
          }
        });
      });
    },
    [socket, isConnected]
  );

  const sendLocation = useCallback(async (): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (!socket || !isConnected) {
        reject(new Error('Not connected'));
        return;
      }

      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by your browser'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          socket.emit(
            'sendLocation',
            {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            },
            () => {
              resolve();
            }
          );
        },
        (error) => {
          reject(new Error('Unable to get location: ' + error.message));
        }
      );
    });
  }, [socket, isConnected]);

  const disconnect = useCallback(() => {
    if (socket) {
      socket.disconnect();
      setMessages([]);
      setUsers([]);
      setRoom(null);
      setUsername(null);
    }
  }, [socket]);

  const addLocalMessage = useCallback((message: Message) => {
    setMessages((prev) => [...prev, message]);
  }, []);

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        messages,
        users,
        room,
        username,
        error,
        joinRoom,
        sendMessage,
        sendLocation,
        addLocalMessage,
        disconnect,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

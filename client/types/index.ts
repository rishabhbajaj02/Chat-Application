export interface User {
  id: string;
  username: string;
  room: string;
}

export interface Message {
  id: string;
  username: string;
  text: string;
  createdAt: number;
  type: 'text' | 'location' | 'system' | 'bot';
  url?: string;
}

export interface RoomData {
  room: string;
  users: User[];
}

export interface JoinPayload {
  username: string;
  room: string;
}

export interface ServerToClientEvents {
  message: (message: Message) => void;
  locationMessage: (message: Message) => void;
  roomData: (data: RoomData) => void;
}

export interface ClientToServerEvents {
  join: (payload: JoinPayload, callback: (error?: string) => void) => void;
  sendMessage: (message: string, callback: (error?: string) => void) => void;
  sendLocation: (coords: { latitude: number; longitude: number }, callback: () => void) => void;
}

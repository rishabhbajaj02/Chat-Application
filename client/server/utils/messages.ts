import { v4 as uuidv4 } from 'uuid';

interface Message {
  id: string;
  username: string;
  text: string;
  createdAt: number;
  type: 'text' | 'location' | 'system' | 'bot';
  url?: string;
}

export const generateMessage = (
  username: string,
  text: string,
  type: Message['type'] = 'text'
): Message => {
  return {
    id: uuidv4(),
    username,
    text,
    createdAt: Date.now(),
    type,
  };
};

export const generateLocationMessage = (
  username: string,
  latitude: number,
  longitude: number
): Message => {
  return {
    id: uuidv4(),
    username,
    text: 'Shared location',
    url: `https://google.com/maps?q=${latitude},${longitude}`,
    createdAt: Date.now(),
    type: 'location',
  };
};

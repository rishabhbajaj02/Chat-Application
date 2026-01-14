'use client';

import React, { useEffect, useRef } from 'react';
import { Box } from '@mui/material';
import MessageItem from './MessageItem';
import type { Message } from '@/types';

interface MessageListProps {
  messages: Message[];
  currentUsername: string | null;
}

export default function MessageList({ messages, currentUsername }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <Box
      sx={{
        flex: 1,
        overflow: 'auto',
        p: 2,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {messages.map((message) => (
        <MessageItem
          key={message.id}
          message={message}
          currentUsername={currentUsername}
        />
      ))}
      <div ref={messagesEndRef} />
    </Box>
  );
}

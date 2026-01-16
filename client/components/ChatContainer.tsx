'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Box, CircularProgress, Typography, Alert, IconButton, Drawer } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import LogoutIcon from '@mui/icons-material/Logout';
import { useSocket } from '@/context/SocketContext';
import { useChatBot } from '@/hooks/useChatBot';
import Sidebar from './Sidebar';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import type { Message } from '@/types';

interface ChatContainerProps {
  username: string;
  room: string;
}

export default function ChatContainer({ username, room }: ChatContainerProps) {
  const router = useRouter();
  const {
    isConnected,
    messages,
    users,
    joinRoom,
    sendMessage,
    sendLocation,
    addLocalMessage,
    disconnect,
  } = useSocket();
  const { askBot } = useChatBot();

  const [isJoining, setIsJoining] = useState(true);
  const [joinError, setJoinError] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const join = async () => {
      try {
        await joinRoom(username, room);
        setIsJoining(false);
      } catch (err) {
        setJoinError(err instanceof Error ? err.message : 'Failed to join room');
        setIsJoining(false);
      }
    };

    join();

    return () => {
      disconnect();
    };
  }, [username, room, joinRoom, disconnect]);

  const handleSendMessage = useCallback(
    async (message: string) => {
      await sendMessage(message);
    },
    [sendMessage]
  );

  const handleSendLocation = useCallback(async () => {
    await sendLocation();
  }, [sendLocation]);

  const handleAskBot = useCallback(
    async (question: string): Promise<string> => {
      const response = await askBot(question, room);

      // Add bot response as a local message
      const botMessage: Message = {
        id: `bot-${Date.now()}`,
        username: 'Gemini Bot',
        text: response,
        createdAt: Date.now(),
        type: 'bot',
      };
      addLocalMessage(botMessage);

      return response;
    },
    [askBot, room, addLocalMessage]
  );

  const handleLeave = () => {
    disconnect();
    router.push('/');
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  // Loading state
  if (isJoining) {
    return (
      <Box
        sx={{
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'background.default',
          gap: 2,
        }}
      >
        <CircularProgress size={48} />
        <Typography color="text.secondary">Joining {room}...</Typography>
      </Box>
    );
  }

  // Error state
  if (joinError) {
    return (
      <Box
        sx={{
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'background.default',
          p: 4,
        }}
      >
        <Alert
          severity="error"
          sx={{ mb: 2, maxWidth: 400 }}
          action={
            <IconButton color="inherit" onClick={() => router.push('/')}>
              <LogoutIcon />
            </IconButton>
          }
        >
          {joinError}
        </Alert>
        <Typography
          color="text.secondary"
          sx={{ cursor: 'pointer', textDecoration: 'underline' }}
          onClick={() => router.push('/')}
        >
          Go back to join page
        </Typography>
      </Box>
    );
  }

  const sidebarContent = (
    <Sidebar room={room} users={users} currentUsername={username} />
  );

  return (
    <Box sx={{ display: 'flex', height: '100vh', bgcolor: 'background.default' }}>
      {/* Mobile drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 250 },
        }}
      >
        {sidebarContent}
      </Drawer>

      {/* Desktop sidebar */}
      <Box
        component="nav"
        sx={{
          display: { xs: 'none', md: 'block' },
          flexShrink: 0,
        }}
      >
        {sidebarContent}
      </Box>

      {/* Main chat area */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <Box
          sx={{
            p: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            bgcolor: 'background.paper',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              onClick={handleDrawerToggle}
              sx={{ display: { md: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h3" sx={{ color: 'text.primary', textTransform: 'capitalize' }}>
              {room}
            </Typography>
            {!isConnected && (
              <Typography
                variant="caption"
                sx={{
                  color: 'error.main',
                  ml: 1,
                }}
              >
                (Reconnecting...)
              </Typography>
            )}
          </Box>
          <IconButton onClick={handleLeave} sx={{ color: 'text.secondary' }}>
            <LogoutIcon />
          </IconButton>
        </Box>

        {/* Messages */}
        <MessageList messages={messages} currentUsername={username} />

        {/* Input */}
        <MessageInput
          onSendMessage={handleSendMessage}
          onSendLocation={handleSendLocation}
          onAskBot={handleAskBot}
          disabled={!isConnected}
        />
      </Box>
    </Box>
  );
}

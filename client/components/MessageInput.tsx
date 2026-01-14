'use client';

import React, { useState } from 'react';
import {
  Box,
  TextField,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert,
  Snackbar,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import SmartToyIcon from '@mui/icons-material/SmartToy';

interface MessageInputProps {
  onSendMessage: (message: string) => Promise<void>;
  onSendLocation: () => Promise<void>;
  onAskBot: (question: string) => Promise<string>;
  disabled?: boolean;
}

export default function MessageInput({
  onSendMessage,
  onSendLocation,
  onAskBot,
  disabled = false,
}: MessageInputProps) {
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isSendingLocation, setIsSendingLocation] = useState(false);
  const [isAskingBot, setIsAskingBot] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedMessage = message.trim();
    if (!trimmedMessage || isSending) return;

    setIsSending(true);
    setError(null);

    try {
      // Check if it's a bot command
      if (trimmedMessage.toLowerCase().startsWith('@bot ')) {
        const question = trimmedMessage.slice(5).trim();
        if (question) {
          setIsAskingBot(true);
          // First send the user's question
          await onSendMessage(trimmedMessage);
          // Then get and send bot response
          const response = await onAskBot(question);
          // The bot response will be handled by the parent component
        }
      } else {
        await onSendMessage(trimmedMessage);
      }
      setMessage('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
    } finally {
      setIsSending(false);
      setIsAskingBot(false);
    }
  };

  const handleLocationClick = async () => {
    if (isSendingLocation) return;

    setIsSendingLocation(true);
    setError(null);

    try {
      await onSendLocation();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send location');
    } finally {
      setIsSendingLocation(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <>
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          p: 2,
          bgcolor: 'background.paper',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          alignItems: 'center',
          gap: 1,
        }}
      >
        <TextField
          fullWidth
          placeholder="Type a message... (use @bot to ask AI)"
          variant="outlined"
          size="small"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled || isSending}
          autoComplete="off"
          sx={{
            '& .MuiOutlinedInput-root': {
              bgcolor: 'rgba(255, 255, 255, 0.05)',
            },
          }}
        />

        <Tooltip title="Send Location">
          <span>
            <IconButton
              onClick={handleLocationClick}
              disabled={disabled || isSendingLocation}
              sx={{ color: 'text.secondary' }}
            >
              {isSendingLocation ? (
                <CircularProgress size={24} />
              ) : (
                <LocationOnIcon />
              )}
            </IconButton>
          </span>
        </Tooltip>

        <Tooltip title="Send Message">
          <span>
            <IconButton
              type="submit"
              disabled={disabled || isSending || !message.trim()}
              sx={{
                bgcolor: 'primary.main',
                color: 'white',
                '&:hover': {
                  bgcolor: 'primary.dark',
                },
                '&:disabled': {
                  bgcolor: 'grey.800',
                  color: 'grey.500',
                },
              }}
            >
              {isSending ? (
                isAskingBot ? (
                  <SmartToyIcon />
                ) : (
                  <CircularProgress size={24} color="inherit" />
                )
              ) : (
                <SendIcon />
              )}
            </IconButton>
          </span>
        </Tooltip>
      </Box>

      <Snackbar
        open={!!error}
        autoHideDuration={4000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity="error"
          onClose={() => setError(null)}
          sx={{ width: '100%' }}
        >
          {error}
        </Alert>
      </Snackbar>
    </>
  );
}

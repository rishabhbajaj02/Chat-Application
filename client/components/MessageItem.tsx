'use client';

import React from 'react';
import { Box, Typography, Avatar, Link, Paper } from '@mui/material';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { format } from 'date-fns';
import type { Message } from '@/types';

interface MessageItemProps {
  message: Message;
  currentUsername: string | null;
}

export default function MessageItem({ message, currentUsername }: MessageItemProps) {
  const isOwnMessage = message.username.toLowerCase() === currentUsername?.toLowerCase();
  const isSystemMessage = message.type === 'system';
  const isBotMessage = message.type === 'bot';
  const isLocationMessage = message.type === 'location';

  const formattedTime = format(new Date(message.createdAt), 'h:mm a');

  // System message (join/leave notifications)
  if (isSystemMessage) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          my: 1,
        }}
      >
        <Typography
          variant="caption"
          sx={{
            color: 'text.secondary',
            bgcolor: 'rgba(255, 255, 255, 0.05)',
            px: 2,
            py: 0.5,
            borderRadius: 2,
            fontSize: 12,
          }}
        >
          {message.text}
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: isOwnMessage ? 'row-reverse' : 'row',
        alignItems: 'flex-start',
        mb: 2,
        gap: 1,
      }}
    >
      {/* Avatar */}
      <Avatar
        sx={{
          width: 36,
          height: 36,
          bgcolor: isBotMessage ? '#4285F4' : isOwnMessage ? 'primary.main' : 'grey.700',
          fontSize: 14,
        }}
      >
        {isBotMessage ? (
          <SmartToyIcon sx={{ fontSize: 20 }} />
        ) : (
          message.username.charAt(0).toUpperCase()
        )}
      </Avatar>

      {/* Message Content */}
      <Box
        sx={{
          maxWidth: '70%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: isOwnMessage ? 'flex-end' : 'flex-start',
        }}
      >
        {/* Username and Time */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            mb: 0.5,
            flexDirection: isOwnMessage ? 'row-reverse' : 'row',
          }}
        >
          <Typography
            variant="caption"
            sx={{
              color: isBotMessage ? '#4285F4' : 'primary.main',
              fontWeight: 600,
              textTransform: 'capitalize',
              fontSize: 13,
            }}
          >
            {isBotMessage ? 'Gemini Bot' : message.username}
          </Typography>
          <Typography
            variant="caption"
            sx={{ color: 'text.secondary', fontSize: 11 }}
          >
            {formattedTime}
          </Typography>
        </Box>

        {/* Message Bubble */}
        <Paper
          elevation={0}
          sx={{
            p: 1.5,
            bgcolor: isBotMessage
              ? 'rgba(66, 133, 244, 0.15)'
              : isOwnMessage
              ? 'primary.main'
              : 'rgba(255, 255, 255, 0.08)',
            borderRadius: 2,
            borderTopRightRadius: isOwnMessage ? 0 : 2,
            borderTopLeftRadius: isOwnMessage ? 2 : 0,
          }}
        >
          {isLocationMessage ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <LocationOnIcon sx={{ color: 'error.main', fontSize: 20 }} />
              <Link
                href={message.url}
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                  color: isOwnMessage ? 'white' : 'primary.light',
                  textDecoration: 'underline',
                }}
              >
                View Location
              </Link>
            </Box>
          ) : (
            <Typography
              variant="body2"
              sx={{
                color: isOwnMessage ? 'white' : 'text.primary',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
              }}
            >
              {message.text}
            </Typography>
          )}
        </Paper>
      </Box>
    </Box>
  );
}

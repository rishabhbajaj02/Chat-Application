'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
} from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';

export default function JoinForm() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [room, setRoom] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!username.trim() || !room.trim()) {
      setError('Username and room are required!');
      return;
    }

    setIsLoading(true);

    // Navigate to chat page with query params
    router.push(`/chat?username=${encodeURIComponent(username.trim())}&room=${encodeURIComponent(room.trim())}`);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        p: 2,
      }}
    >
      <Card
        sx={{
          width: '100%',
          maxWidth: 400,
          bgcolor: 'background.paper',
        }}
      >
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <ChatIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
            <Typography variant="h1" component="h1" sx={{ color: 'text.primary' }}>
              Join Chat
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Display Name"
              variant="outlined"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              sx={{ mb: 2 }}
              autoFocus
              disabled={isLoading}
            />

            <TextField
              fullWidth
              label="Room"
              variant="outlined"
              value={room}
              onChange={(e) => setRoom(e.target.value)}
              sx={{ mb: 3 }}
              disabled={isLoading}
            />

            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              disabled={isLoading}
              sx={{
                py: 1.5,
                bgcolor: 'primary.main',
                '&:hover': {
                  bgcolor: 'primary.dark',
                },
              }}
            >
              {isLoading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                'Join'
              )}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}

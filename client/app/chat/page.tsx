'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, Suspense } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import ChatContainer from '@/components/ChatContainer';

function ChatPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const username = searchParams.get('username');
  const room = searchParams.get('room');

  useEffect(() => {
    if (!username || !room) {
      router.push('/');
    }
  }, [username, room, router]);

  if (!username || !room) {
    return (
      <Box
        sx={{
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'background.default',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return <ChatContainer username={username} room={room} />;
}

export default function ChatPage() {
  return (
    <Suspense
      fallback={
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
          <Typography color="text.secondary">Loading...</Typography>
        </Box>
      }
    >
      <ChatPageContent />
    </Suspense>
  );
}

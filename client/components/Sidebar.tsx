'use client';

import React from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Divider,
  Badge,
} from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import type { User } from '@/types';

interface SidebarProps {
  room: string;
  users: User[];
  currentUsername: string | null;
}

export default function Sidebar({ room, users, currentUsername }: SidebarProps) {
  return (
    <Box
      sx={{
        width: 250,
        bgcolor: 'secondary.main',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        borderRight: '1px solid rgba(255, 255, 255, 0.1)',
      }}
    >
      {/* Room Header */}
      <Box
        sx={{
          p: 2,
          bgcolor: 'secondary.dark',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <Typography
          variant="h2"
          sx={{
            color: 'text.primary',
            textTransform: 'capitalize',
            fontWeight: 500,
          }}
        >
          {room}
        </Typography>
      </Box>

      {/* Users Section */}
      <Box sx={{ p: 2, flex: 1, overflow: 'auto' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <PeopleIcon sx={{ color: 'text.secondary', mr: 1, fontSize: 20 }} />
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Users ({users.length})
          </Typography>
        </Box>

        <List sx={{ p: 0 }}>
          {users.map((user) => (
            <ListItem
              key={user.id}
              sx={{
                px: 0,
                py: 0.75,
              }}
            >
              <ListItemAvatar sx={{ minWidth: 40 }}>
                <Badge
                  overlap="circular"
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  badgeContent={
                    <Box
                      sx={{
                        width: 10,
                        height: 10,
                        borderRadius: '50%',
                        bgcolor: 'success.main',
                        border: '2px solid',
                        borderColor: 'secondary.main',
                      }}
                    />
                  }
                >
                  <Avatar
                    sx={{
                      width: 32,
                      height: 32,
                      fontSize: 14,
                      bgcolor: user.username === currentUsername ? 'primary.main' : 'grey.700',
                    }}
                  >
                    {user.username.charAt(0).toUpperCase()}
                  </Avatar>
                </Badge>
              </ListItemAvatar>
              <ListItemText
                primary={user.username}
                primaryTypographyProps={{
                  sx: {
                    color: 'text.primary',
                    fontSize: 14,
                    textTransform: 'capitalize',
                    fontWeight: user.username === currentUsername ? 600 : 400,
                  },
                }}
              />
              {user.username === currentUsername && (
                <Typography
                  variant="caption"
                  sx={{ color: 'text.secondary', fontSize: 11 }}
                >
                  (you)
                </Typography>
              )}
            </ListItem>
          ))}
        </List>
      </Box>
    </Box>
  );
}

// src/components/ChatPage.js
import React from 'react';
import { Outlet } from 'react-router-dom';
import { Box, Paper } from '@mui/material';
import ChatRoomList from './ChatRoomList';

const ChatPage = () => {
    return (
        <Box 
            sx={{ 
                display: 'flex', 
                width: '100%', 
                height: 'calc(100vh - 64px)', // Adjusted to account for Navbar height if Navbar has fixed height (e.g., 64px)
            }}
        >
            {/* Sidebar: ChatRoomList */}
            <Paper
                sx={{
                    width: { xs: '100%', sm: '250px' },
                    display: 'flex',
                    flexDirection: 'column',
                    borderRight: { sm: '1px solid #ccc' }, // Border only on small and up screens
                    backgroundColor: '#ffffff',
                    flexShrink: 0, // Prevent shrinking
                    height: '100%',
                }}
            >
                <ChatRoomList />
            </Paper>

            {/* Main Content: ChatWindow or Placeholder */}
            <Box 
                sx={{ 
                    flexGrow: 1, 
                    display: 'flex', 
                    flexDirection: 'column',
                    height: '100%',
                }}
            >
                <Outlet />
            </Box>
        </Box>
    );
};

export default ChatPage;

// src/components/ChatRoomList.js
import React, { useEffect, useState } from 'react';
import API from '../api';
import { Link } from 'react-router-dom';

const ChatRoomList = () => {
    const [rooms, setRooms] = useState([]);

    useEffect(() => {
        const fetchRooms = async () => {
            const response = await API.get('rooms/');
            setRooms(response.data);
        };
        fetchRooms();
    }, []);

    return (
        <div>
            <h2>Chat Rooms</h2>
            <ul>
                {rooms.map((room) => (
                    <li key={room.id}>
                        <Link to={`/chat/${room.name}`}>{room.name} ({room.is_group ? 'Group' : 'Direct'})</Link>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default ChatRoomList;

// src/components/ChatWindow.js
import React, { useEffect, useState, useRef } from 'react';
import API from '../api';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Box, Typography, TextField, Button, Avatar, Paper } from '@mui/material';

const ChatWindow = () => {
    const { roomName } = useParams();
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [otherUser, setOtherUser] = useState(null);
    const socketRef = useRef(null);
    const messagesEndRef = useRef(null);
    const auth = useSelector((state) => state.auth);

    const currentUsername = auth.user ? auth.user.username : '';
    const currentUserId = auth.user ? auth.user.id : null;

    useEffect(() => {
        const fetchRoomAndMessages = async () => {
            try {
                const response = await API.get('rooms/');
                const room = response.data.find((r) => r.name === roomName);
                if (!room) return;

                // Assuming it's a direct chat
                const oUser = room.participants.find(p => p.id !== currentUserId);
                setOtherUser(oUser || null);

                const msgRes = await API.get(`rooms/${room.id}/messages/`);
                setMessages(msgRes.data);

                const token = localStorage.getItem('access'); // Adjust if needed
                const socketUrl = `ws://localhost:8000/ws/chat/${roomName}/?token=${token}`;
                socketRef.current = new WebSocket(socketUrl);

                socketRef.current.onmessage = (e) => {
                    const data = JSON.parse(e.data);
                    if (data.message) {
                        setMessages((prev) => [...prev, data.message]);
                    }
                };

                socketRef.current.onerror = (error) => {
                    console.error('WebSocket error:', error);
                };

                socketRef.current.onclose = (e) => {
                    console.log(`WebSocket closed with code: ${e.code}`);
                    // Optionally implement reconnection logic here
                };
            } catch (error) {
                console.error('Error fetching room or messages:', error);
            }
        };

        fetchRoomAndMessages();

        return () => {
            if (socketRef.current) socketRef.current.close();
        };
    }, [roomName, currentUserId]);

    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    const sendMessage = () => {
        if (input.trim() !== '' && socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
            const message = { message: input };
            socketRef.current.send(JSON.stringify(message));
            setInput('');
        }
    };

    return (
        <Box 
            sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                minHeight: '100vh', 
                backgroundColor: '#e0e0e0', // Light background for contrast
                padding: 2
            }}
        >
            <Paper 
                elevation={3}
                sx={{
                    width: { xs: '100%', sm: '600px', md: '700px' }, // Responsive width
                    height: { xs: '90vh', sm: '80vh' }, // Responsive height
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: 2,
                }}
            >
                {/* Header with other user image and name */}
                <Box 
                    sx={{ 
                        p: 2, 
                        borderBottom: '1px solid #ccc', 
                        flexShrink: 0,
                        backgroundColor: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2
                    }}
                >
                    {otherUser && (
                        <Avatar 
                            src={otherUser.image_url || '/static/images/default_avatar.png'} 
                            alt={otherUser.username}
                            sx={{ width: 40, height: 40 }}
                        />
                    )}
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                        {otherUser ? otherUser.username : 'Chat'}
                    </Typography>
                </Box>

                {/* Messages Area */}
                <Box 
                    sx={{ 
                        flexGrow: 1, 
                        overflowY: 'auto', 
                        p: 2, 
                        backgroundColor: '#f9f9f9',
                        '&::-webkit-scrollbar': {
                            width: '8px',
                        },
                        '&::-webkit-scrollbar-track': {
                            background: '#f1f1f1',
                            borderRadius: '4px',
                        },
                        '&::-webkit-scrollbar-thumb': {
                            background: '#c1c1c1',
                            borderRadius: '4px',
                        },
                        '&::-webkit-scrollbar-thumb:hover': {
                            background: '#a8a8a8',
                        },
                    }}
                >
                    {messages.length === 0 ? (
                        <Typography variant="body1" color="textSecondary" align="center">
                            Start the conversation!
                        </Typography>
                    ) : (
                        messages.map((msg) => {
                            const isCurrentUser = msg.sender.username === currentUsername;
                            const avatarUrl = msg.sender.image_url || '/static/images/default_avatar.png';
                            return (
                                <Box 
                                    key={msg.id} 
                                    sx={{ 
                                        display: 'flex', 
                                        justifyContent: isCurrentUser ? 'flex-end' : 'flex-start',
                                        mb: 2,
                                        alignItems: 'flex-end'
                                    }}
                                >
                                    {/* If not current user, avatar on the left */}
                                    {!isCurrentUser && (
                                        <Avatar 
                                            src={avatarUrl} 
                                            alt={msg.sender.username} 
                                            sx={{ width: 32, height: 32, mr: 1 }}
                                        />
                                    )}

                                    <Box
                                        sx={{
                                            maxWidth: '70%',
                                            backgroundColor: isCurrentUser ? '#CBE8FF' : '#ffffff',
                                            borderRadius: '20px',
                                            padding: '10px 14px',
                                            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                                        }}
                                    >
                                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                                            {msg.sender.username}
                                        </Typography>
                                        <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                                            {msg.content}
                                        </Typography>
                                    </Box>

                                    {/* If current user, avatar on the right */}
                                    {isCurrentUser && (
                                        <Avatar 
                                            src={avatarUrl} 
                                            alt={msg.sender.username}
                                            sx={{ width: 32, height: 32, ml: 1 }}
                                        />
                                    )}
                                </Box>
                            );
                        })
                    )}
                    <div ref={messagesEndRef} />
                </Box>

                {/* Input Area */}
                <Box 
                    sx={{ 
                        p: 2, 
                        borderTop: '1px solid #ccc', 
                        flexShrink: 0, 
                        display: 'flex', 
                        gap: 1, 
                        backgroundColor: '#fff' 
                    }}
                >
                    <TextField 
                        variant="outlined" 
                        size="small"
                        fullWidth
                        placeholder="Type a message..."
                        value={input} 
                        onChange={(e) => setInput(e.target.value)} 
                        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    />
                    <Button variant="contained" onClick={sendMessage}>
                        Send
                    </Button>
                </Box>
            </Paper>
        </Box>
    );

};

export default ChatWindow;


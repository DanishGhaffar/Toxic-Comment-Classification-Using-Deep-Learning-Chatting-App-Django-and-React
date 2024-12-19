// src/components/ChatWindow.js
import React, { useEffect, useState, useRef } from 'react';
import API from '../api';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
    Box,
    Typography,
    TextField,
    Button,
    Avatar,
    Paper,
    CircularProgress,
    List,
    ListItem,
    ListItemAvatar,
    IconButton,
    Menu,
    MenuItem,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import MoreVertIcon from '@mui/icons-material/MoreVert';

const ChatWindow = () => {
    const { roomName } = useParams();
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [otherUser, setOtherUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const socketRef = useRef(null);
    const messagesEndRef = useRef(null);
    const auth = useSelector((state) => state.auth);

    const currentUserId = auth.user ? auth.user.id : null;

    // Menu state
    const [anchorEl, setAnchorEl] = useState(null);
    const menuOpen = Boolean(anchorEl);

    // Feedback dialog state
    const [feedbackOpen, setFeedbackOpen] = useState(false);
    const [feedbackText, setFeedbackText] = useState('');
    const [submittingFeedback, setSubmittingFeedback] = useState(false);

    // Create Group dialog state
    const [createGroupOpen, setCreateGroupOpen] = useState(false);
    const [groupName, setGroupName] = useState('');
    const [creatingGroup, setCreatingGroup] = useState(false);

    useEffect(() => {
        const fetchRoomAndMessages = async () => {
            try {
                const response = await API.get('rooms/');
                const room = response.data.find((r) => r.name === roomName);
                if (!room) {
                    console.error('Room not found');
                    setLoading(false);
                    return;
                }

                const oUser = room.participants.find((p) => p.id !== currentUserId);
                setOtherUser(oUser || null);

                const msgRes = await API.get(`rooms/${room.id}/messages/`);
                setMessages(msgRes.data);
                setLoading(false);

                // WebSocket Connection
                const token = localStorage.getItem('access');
                const wsProtocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
                const backendURL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';
                const socketUrl = `${wsProtocol}://${new URL(backendURL).hostname}:${new URL(backendURL).port}/ws/chat/${roomName}/?token=${token}`;
                socketRef.current = new WebSocket(socketUrl);

                socketRef.current.onopen = () => {
                    console.log('WebSocket connected');
                };

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
                };
            } catch (error) {
                console.error('Error fetching room or messages:', error);
                setLoading(false);
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

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    };

    // Menu Handlers
    const handleMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };
    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    // Feedback Handlers
    const handleFeedbackOpen = () => {
        setFeedbackOpen(true);
        handleMenuClose();
    };
    const handleFeedbackClose = () => {
        setFeedbackOpen(false);
        setFeedbackText('');
    };
    const submitFeedback = async () => {
        setSubmittingFeedback(true);
        try {
            await API.post('feedback/', { content: feedbackText });
            setSubmittingFeedback(false);
            handleFeedbackClose();
            alert('Feedback submitted successfully!');
        } catch (error) {
            console.error('Error submitting feedback:', error);
            setSubmittingFeedback(false);
            alert('Failed to submit feedback. Please try again.');
        }
    };

    // Create Group Handlers
    const handleCreateGroupOpen = () => {
        setCreateGroupOpen(true);
        handleMenuClose();
    };
    const handleCreateGroupClose = () => {
        setCreateGroupOpen(false);
        setGroupName('');
    };
    const submitCreateGroup = async () => {
        setCreatingGroup(true);
        try {
            await API.post('rooms/', { name: groupName, is_group: true });
            setCreatingGroup(false);
            handleCreateGroupClose();
            alert('Group created successfully!');
            // Optionally, redirect to the new group's chat window
        } catch (error) {
            console.error('Error creating group:', error);
            setCreatingGroup(false);
            alert('Failed to create group. Please try again.');
        }
    };

    return (
        <Box 
            sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                width: '100%',
                height: '100vh', // Full viewport height
                backgroundColor: '#e0e0e0', 
                padding: 2,
                boxSizing: 'border-box',
            }}
        >
            <Paper 
                elevation={3}
                sx={{
                    width: { xs: '100%', sm: '600px', md: '700px' },
                    height: { xs: '90vh', sm: '80vh' },
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: 2,
                    overflow: 'hidden',
                }}
            >
                {/* Header */}
                <Box 
                    sx={{ 
                        p: 2, 
                        borderBottom: '1px solid #ccc', 
                        backgroundColor: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 2,
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
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
                    <IconButton onClick={handleMenuOpen}>
                        <MoreVertIcon />
                    </IconButton>
                    <Menu
                        anchorEl={anchorEl}
                        open={menuOpen}
                        onClose={handleMenuClose}
                        anchorOrigin={{
                            vertical: 'bottom',
                            horizontal: 'right',
                        }}
                        transformOrigin={{
                            vertical: 'top',
                            horizontal: 'right',
                        }}
                    >
                        <MenuItem onClick={handleFeedbackOpen}>Feedback</MenuItem>
                        <MenuItem onClick={handleCreateGroupOpen}>Create Group</MenuItem>
                    </Menu>
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
                    {loading ? (
                        <Box
                            sx={{
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                height: '100%',
                            }}
                        >
                            <CircularProgress />
                        </Box>
                    ) : messages.length === 0 ? (
                        <Typography variant="body1" color="textSecondary" align="center">
                            Start the conversation!
                        </Typography>
                    ) : (
                        <List sx={{ width: '100%', padding: 0 }}>
                            {messages.map((msg) => {
                                const isCurrentUser = msg.sender.id === currentUserId;
                                const avatarUrl = msg.sender.image_url || '/static/images/default_avatar.png';
                                return (
                                    <ListItem 
                                        key={msg.id}
                                        sx={{ 
                                            display: 'flex', 
                                            justifyContent: isCurrentUser ? 'flex-end' : 'flex-start',
                                            alignItems: 'flex-start',
                                            mb: 2,
                                            padding: 0,
                                        }}
                                    >
                                        {!isCurrentUser && (
                                            <ListItemAvatar sx={{ marginRight: 1, flexShrink: 0 }}>
                                                <Avatar 
                                                    src={avatarUrl} 
                                                    alt={msg.sender.username} 
                                                    sx={{ width: 32, height: 32 }}
                                                />
                                                <Typography 
                                                    variant="subtitle2" 
                                                    sx={{ 
                                                        fontWeight: 'bold', 
                                                        mb: 0.5, 
                                                        color: isCurrentUser ? '#fff' : '#000' 
                                                    }}
                                                >
                                                    {msg.sender.username}
                                                </Typography>
                                            </ListItemAvatar>
                                        )}

                                        <Box
                                            sx={{
                                                maxWidth: '70%',
                                                backgroundColor: isCurrentUser ? '#007BFF' : '#f1f0f0',
                                                color: isCurrentUser ? '#fff' : '#000',
                                                borderRadius: '20px',
                                                padding: '10px 14px',
                                                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'flex-start',
                                                wordBreak: 'break-word',
                                            }}
                                        >
                                            
                                            <Typography 
                                                variant="body2" 
                                                sx={{ whiteSpace: 'pre-wrap' }}
                                            >
                                                {msg.content}
                                            </Typography>
                                            <Typography 
                                                variant="caption" 
                                                color={isCurrentUser ? '#e0e0e0' : 'textSecondary'} 
                                                sx={{ 
                                                    alignSelf: 'flex-end', 
                                                    mt: 0.5 
                                                }}
                                            >
                                                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </Typography>
                                        </Box>

                                        {isCurrentUser && (
                                            <ListItemAvatar sx={{ marginLeft: 1, flexShrink: 0 , alignContent:'justify'}}>
                                                <Avatar 
                                                    src={avatarUrl} 
                                                    alt={msg.sender.username}
                                                    sx={{ width: 32, height: 32 }}
                                                />
                                                <Typography 
                                                    variant="subtitle2" 
                                                    sx={{ 
                                                        fontWeight: 'bold', 
                                                        mb: 0.5, 
                                                        color: 'black'
                                                    }}
                                                >
                                                    {msg.sender.username}
                                                </Typography>
                                            </ListItemAvatar>
                                        )}
                                    </ListItem>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </List>
                    )}
                </Box>

                {/* Input Area */}
                <Box 
                    sx={{ 
                        p: 2, 
                        borderTop: '1px solid #ccc', 
                        backgroundColor: '#fff', 
                        display: 'flex', 
                        gap: 1, 
                        alignItems: 'center',
                    }}
                >
                    <TextField 
                        variant="outlined" 
                        size="small"
                        fullWidth
                        placeholder="Type a message..."
                        value={input} 
                        onChange={(e) => setInput(e.target.value)} 
                        onKeyPress={handleKeyPress}
                        sx={{ 
                            backgroundColor: '#f0f2f5',
                            borderRadius: 1,
                        }}
                    />
                    <Button 
                        variant="contained" 
                        color="primary" 
                        onClick={sendMessage}
                        disabled={input.trim() === ''}
                        endIcon={<SendIcon />}
                        sx={{
                            minWidth: '40px',
                            padding: '10px',
                        }}
                    />
                </Box>
            </Paper>

            {/* Feedback Dialog */}
            <Dialog 
                open={feedbackOpen} 
                onClose={handleFeedbackClose} 
                fullWidth 
                maxWidth="md"
            >
                <DialogTitle>Submit Feedback</DialogTitle>
                <DialogContent sx={{ py: 2 }}>
                    <TextField
                        multiline
                        minRows={6}
                        fullWidth
                        variant="outlined"
                        label="Your feedback"
                        value={feedbackText}
                        onChange={(e) => setFeedbackText(e.target.value)}
                        placeholder="Share your thoughts..."
                    />
                </DialogContent>
                <DialogActions sx={{ pr: 2, pb: 2 }}>
                    <Button onClick={handleFeedbackClose} disabled={submittingFeedback}>Cancel</Button>
                    <Button 
                        onClick={submitFeedback} 
                        variant="contained" 
                        color="primary" 
                        disabled={submittingFeedback || feedbackText.trim() === ''}
                    >
                        {submittingFeedback ? 'Submitting...' : 'Submit'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Create Group Dialog */}
            <Dialog 
                open={createGroupOpen} 
                onClose={handleCreateGroupClose}
                fullWidth 
                maxWidth="sm"
            >
                <DialogTitle>Create Group</DialogTitle>
                <DialogContent sx={{ py: 2 }}>
                    <TextField
                        fullWidth
                        variant="outlined"
                        label="Group Name"
                        value={groupName}
                        onChange={(e) => setGroupName(e.target.value)}
                        placeholder="Enter group name"
                    />
                </DialogContent>
                <DialogActions sx={{ pr: 2, pb: 2 }}>
                    <Button onClick={handleCreateGroupClose} disabled={creatingGroup}>Cancel</Button>
                    <Button 
                        onClick={submitCreateGroup} 
                        variant="contained" 
                        color="primary" 
                        disabled={creatingGroup || groupName.trim() === ''}
                    >
                        {creatingGroup ? 'Creating...' : 'Create'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
        );
    };

    export default ChatWindow;

// src/components/FlaggedMessages.js

import React, { useEffect, useState } from 'react';
import {
    Typography,
    List,
    ListItem,
    ListItemAvatar,
    Avatar,
    ListItemText,
    Divider,
    IconButton,
    Snackbar,
    Alert,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import API from '../api';

const FlaggedMessages = () => {
    const [flaggedMessages, setFlaggedMessages] = useState([]);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    useEffect(() => {
        fetchFlaggedMessages();
    }, []);

    const fetchFlaggedMessages = async () => {
        try {
            const response = await API.get('/flagged-messages/');
            setFlaggedMessages(response.data);
        } catch (error) {
            console.error('Error fetching flagged messages:', error);
            setSnackbar({ open: true, message: 'Failed to fetch flagged messages.', severity: 'error' });
        }
    };

    const handleDelete = async (messageId) => {
        try {
            await API.delete(`/delete-message/${messageId}/`);
            setFlaggedMessages(prev => prev.filter(msg => msg.id !== messageId));
            setSnackbar({ open: true, message: 'Message deleted successfully.', severity: 'success' });
        } catch (error) {
            console.error('Error deleting message:', error);
            setSnackbar({ open: true, message: 'Failed to delete message.', severity: 'error' });
        }
    };

    const handleCloseSnackbar = () => {
        setSnackbar({ ...snackbar, open: false });
    };

    return (
        <div>
            <Typography variant="h5" gutterBottom>
                Flagged Messages
            </Typography>
            {flaggedMessages.length === 0 ? (
                <Typography variant="body1">No flagged messages.</Typography>
            ) : (
                <List>
                    {flaggedMessages.map(msg => (
                        <React.Fragment key={msg.id}>
                            <ListItem alignItems="flex-start">
                                <ListItemAvatar>
                                    <Avatar src={msg.sender_profile.image || '/static/images/default_avatar.png'} alt={msg.sender_username} />
                                </ListItemAvatar>
                                <ListItemText
                                    primary={<Typography variant="h6">{msg.sender_username}</Typography>}
                                    secondary={
                                        <>
                                            <Typography variant="body2" color="text.primary">
                                                {msg.content}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary" display="block">
                                                Toxicity Type: {msg.toxicity.replace('_', ' ').toUpperCase()}
                                            </Typography>
                                        </>
                                    }
                                />
                                <IconButton edge="end" aria-label="delete" onClick={() => handleDelete(msg.id)}>
                                    <DeleteIcon />
                                </IconButton>
                            </ListItem>
                            <Divider component="li" />
                        </React.Fragment>
                    ))}
                </List>
            )}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </div>
    );
};

export default FlaggedMessages;

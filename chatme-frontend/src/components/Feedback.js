// src/components/Feedback.js

import React, { useEffect, useState } from 'react';
import {
    Typography,
    Box,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    CircularProgress,
    Alert,
    IconButton
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import API from '../api';

const Feedback = () => {
    const [feedbacks, setFeedbacks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [deleteError, setDeleteError] = useState(null); // For delete-specific errors
    const [deletingId, setDeletingId] = useState(null); // Track which feedback is being deleted

    useEffect(() => {
        const fetchFeedback = async () => {
            try {
                const response = await API.get('feedback-list/');
                setFeedbacks(response.data);
            } catch (err) {
                console.error('Error fetching feedback:', err);
                setError('Failed to load feedback.');
            } finally {
                setLoading(false);
            }
        };

        fetchFeedback();
    }, []);

    const handleDelete = async (id) => {
        setDeletingId(id);
        setDeleteError(null);
        try {
            await API.delete(`feedback/${id}/`);
            // Remove the deleted feedback from state
            setFeedbacks(prev => prev.filter(fb => fb.id !== id));
        } catch (err) {
            console.error('Error deleting feedback:', err);
            setDeleteError('Failed to delete feedback. Please try again.');
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <Box sx={{ p: 2 }}>
            <Typography variant="h5" gutterBottom>
                Feedback
            </Typography>
            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mt: 4 }}>
                    <CircularProgress />
                </Box>
            ) : error ? (
                <Alert severity="error">{error}</Alert>
            ) : feedbacks.length === 0 ? (
                <Typography variant="body1">No feedback available.</Typography>
            ) : (
                <>
                    {deleteError && <Alert severity="error" sx={{ mb: 2 }}>{deleteError}</Alert>}
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell><strong>User Name</strong></TableCell>
                                    <TableCell><strong>Feedback</strong></TableCell>
                                    <TableCell><strong>Time</strong></TableCell>
                                    <TableCell align="right"><strong>Actions</strong></TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {feedbacks.map((fb) => (
                                    <TableRow key={fb.id}>
                                        <TableCell>{fb.username}</TableCell>
                                        <TableCell>{fb.feedback}</TableCell>
                                        <TableCell>{new Date(fb.timestamp).toLocaleString()}</TableCell>
                                        <TableCell align="right">
                                            <IconButton
                                                onClick={() => handleDelete(fb.id)}
                                                disabled={deletingId === fb.id}
                                                size="small"
                                                color="error"
                                            >
                                                {deletingId === fb.id ? (
                                                    <CircularProgress size={20} />
                                                ) : (
                                                    <DeleteIcon />
                                                )}
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </>
            )}
        </Box>
    );
};

export default Feedback;

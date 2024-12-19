// src/components/UserActivity.js

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
    Grid,
    Button
} from '@mui/material';
import API from '../api';

import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const UserActivity = () => {
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [blockError, setBlockError] = useState(null);

    const fetchUserActivity = async () => {
        try {
            const response = await API.get('user-activity-list/');
            setUsers(response.data);
        } catch (err) {
            console.error('Error fetching user activity:', err);
            setError('Failed to load user activity.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUserActivity();
    }, []);

    const handleUserClick = (user) => {
        setSelectedUser(user);
    };

    const updateBlockStatus = async (userId, is_blocked) => {
        setBlockError(null);
        try {
            await API.patch(`user-block/${userId}/`, { is_blocked });
            // After updating block status, refetch the data so the UI updates
            await fetchUserActivity();
            // If the selected user is updated, refresh them too
            if (selectedUser && selectedUser.id === userId) {
                setSelectedUser({ ...selectedUser, is_blocked });
            }
        } catch (err) {
            console.error(`Error updating block status:`, err);
            setBlockError('Failed to change block status. Ensure you have permission.');
        }
    };

    const chartData = selectedUser
        ? {
            labels: ['Toxic Messages', 'Non-Toxic Messages'],
            datasets: [
                {
                    label: 'Message Counts',
                    data: [selectedUser.toxic_count, selectedUser.non_toxic_count],
                    backgroundColor: ['#f44336', '#4caf50'], // red, green
                    hoverBackgroundColor: ['#e53935', '#43a047']
                }
            ]
        }
        : null;

    return (
        <Box sx={{ p: 2 }}>
            <Typography variant="h5" gutterBottom>
                User Activity
            </Typography>
            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mt: 4 }}>
                    <CircularProgress />
                </Box>
            ) : error ? (
                <Alert severity="error">{error}</Alert>
            ) : users.length === 0 ? (
                <Typography variant="body1">No user activity available.</Typography>
            ) : (
                <Grid container spacing={2}>
                    {/* Left column: User list */}
                    <Grid item xs={12} md={6}>
                        {blockError && <Alert severity="error" sx={{ mb: 2 }}>{blockError}</Alert>}
                        <TableContainer component={Paper}>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell><strong>User Name</strong></TableCell>
                                        <TableCell><strong>Toxic</strong></TableCell>
                                        <TableCell><strong>Non-Toxic</strong></TableCell>
                                        <TableCell align="right"><strong>Actions</strong></TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {users.map((user) => (
                                        <TableRow
                                            key={user.id}
                                            hover
                                            style={{ cursor: 'pointer' }}
                                            onClick={() => handleUserClick(user)}
                                        >
                                            <TableCell>{user.username}</TableCell>
                                            <TableCell>{user.toxic_count}</TableCell>
                                            <TableCell>{user.non_toxic_count}</TableCell>
                                            <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                                                {!user.is_blocked ? (
                                                    <Button
                                                        variant="contained"
                                                        color="error"
                                                        size="small"
                                                        onClick={() => updateBlockStatus(user.id, true)}
                                                    >
                                                        Block
                                                    </Button>
                                                ) : (
                                                    <Button
                                                        variant="contained"
                                                        color="success"
                                                        size="small"
                                                        onClick={() => updateBlockStatus(user.id, false)}
                                                    >
                                                        Unblock
                                                    </Button>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Grid>

                    {/* Right column: Pie Chart */}
                    <Grid item xs={12} md={6} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        {selectedUser ? (
                            <Box>
                                <Typography variant="h6" gutterBottom textAlign="center">
                                    Message Distribution for {selectedUser.username}
                                </Typography>
                                <Box sx={{ width: '300px', mx: 'auto' }}>
                                    <Pie data={chartData} />
                                </Box>
                            </Box>
                        ) : (
                            <Typography variant="body1" textAlign="center">
                                Select a user to view their message distribution.
                            </Typography>
                        )}
                    </Grid>
                </Grid>
            )}
        </Box>
    );
};

export default UserActivity;

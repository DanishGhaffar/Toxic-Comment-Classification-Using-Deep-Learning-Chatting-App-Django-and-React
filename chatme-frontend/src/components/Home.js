// src/components/Home.js
import React from 'react';
import { useSelector } from 'react-redux';
import { Container, Box, Typography } from '@mui/material';

const Home = () => {
    const user = useSelector((state) => state.auth.user);

    return (
        <Container maxWidth="md">
            <Box
                sx={{
                    marginTop: 8,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}
            >
                <Typography variant="h4" gutterBottom>
                    Welcome to the Chat App!
                </Typography>
                {user ? (
                    <Typography variant="h6">
                        Logged in as: <strong>{user.email}</strong> ({user.role})
                    </Typography>
                ) : (
                    <Typography variant="h6">No user is currently logged in.</Typography>
                )}
            </Box>
        </Container>
    );
};

export default Home;

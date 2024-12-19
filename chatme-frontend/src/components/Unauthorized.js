// src/components/Unauthorized.js
import React from 'react';
import { Container, Box, Typography } from '@mui/material';

const Unauthorized = () => {
    return (
        <Container component="main" maxWidth="xs">
            <Box
                sx={{
                    marginTop: 8,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    boxShadow: 3,
                    padding: 4,
                    borderRadius: 2,
                    backgroundColor: 'white',
                }}
            >
                <Typography component="h1" variant="h5">
                    Unauthorized
                </Typography>
                <Typography variant="body1" sx={{ mt: 2 }}>
                    You do not have permission to view this page.
                </Typography>
            </Box>
        </Container>
    );
};

export default Unauthorized;

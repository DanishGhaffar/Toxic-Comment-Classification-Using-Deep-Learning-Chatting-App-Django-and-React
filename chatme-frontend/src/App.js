// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './components/Login';
import Register from './components/Register';
import Home from './components/Home';
import ProtectedRoute from './components/ProtectedRoute';
import Unauthorized from './components/Unauthorized';
import Profile from './components/Profile';
import { CssBaseline, ThemeProvider, createTheme, Box, Typography } from '@mui/material';
import ChatRoomList from './components/ChatRoomList';
import ChatWindow from './components/ChatWindow';
import ChatPage from './components/ChatPage';
import Dashboard from './components/Dashboard';
import RoleProtectedRoute from './components/RoleProtectedRoute';
import FlaggedMessages from './components/FlaggedMessages';
import Feedback from './components/Feedback';
import UserActivity from './components/UserActivity';


const theme = createTheme({
    palette: {
        background: {
            default: '#f0f2f5', // Light grey background
        },
    },
});

const App = () => {
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Router>
                <Navbar />
                <Box
                    sx={{
                        /*
                        minHeight: '100vh',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        margin:'20px',
                        padding:20,
                        backgroundImage: 'url(https://source.unsplash.com/random/1600x900/?chat)', // Optional background image
                        backgroundRepeat: 'no-repeat',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        */
                        minHeight: '100vh',
                        width: '100%',
                        backgroundImage: 'url(https://source.unsplash.com/random/1600x900/?chat)', // Optional background image
                        backgroundRepeat: 'no-repeat',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        paddingTop:'64px'
                        
                    }}
                >
                    <Routes>
                        <Route path="/" element={<Navigate to="/home" />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route
                            path="/home"
                            element={
                                <ProtectedRoute>
                                    <Home />
                                </ProtectedRoute>
                            }
                        />
                        <Route 
                            path="/profile" 
                            element={
                                <ProtectedRoute>
                                    <Profile />
                                </ProtectedRoute>
                            } 
                        />
                            {/* Dashboard Routes with Nested Routing */}
                        <Route
                            path="/dashboard/*"
                            element={
                                <ProtectedRoute requiredRoles={['admin', 'moderator']}>
                                    <Dashboard />
                                </ProtectedRoute>
                            }
                        >
                            {/* Index Route: Redirect to flagged-messages */}
                            <Route index element={<Navigate to="flagged-messages" replace />} />

                            {/* Flagged Messages Route */}
                            <Route path="flagged-messages" element={<FlaggedMessages />} />

                            {/* Feedback Route */}
                            <Route path="feedback" element={<Feedback />} />

                            {/*User Activity Route*/}
                            <Route path="useractivity" element={<UserActivity />} />

                            {/* Catch-All Route within Dashboard */}
                            <Route path="*" element={<Navigate to="flagged-messages" replace />} />
                        </Route>
                        
                        <Route 
                            path="/rooms" 
                            element={
                                <ProtectedRoute>
                                    <ChatRoomList />
                                </ProtectedRoute>
                        
                        } />
                         {/* Chat Routes with Nested Routing */}
                         <Route 
                            path="/chat/*" 
                            element={
                                <ProtectedRoute checkBlocked={true}>
                                    <ChatPage />
                                </ProtectedRoute>
                            }
                        >
                            {/* Nested Route: Chat Window */}
                            <Route path=":roomName" element={<ChatWindow />} />
                            
                            {/* Default Route: Placeholder Message */}
                            <Route
                                path=""
                                element={
                                    <Box sx={{ p: 2 }}>
                                        <Typography variant="h6">Select a user to start chatting</Typography>
                                    </Box>
                                }
                            />
                        </Route>

                       {/* <Route 
                            path="/chat/:roomName" 
                            element={
                                <ProtectedRoute>
                                    <ChatWindow/>
                                </ProtectedRoute>
                        } />*/}
                        <Route path="/unauthorized" element={<Unauthorized />} />
                        {/* Add other routes as needed */}
                    </Routes>
                </Box>
            </Router>
        </ThemeProvider>
    );
};

export default App;

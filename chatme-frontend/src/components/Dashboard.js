// src/components/Dashboard.js

import React, { useState } from 'react';
import {
    Box,
    Typography,
    Avatar,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    Divider,
    Drawer,
    Toolbar,
    IconButton,
    CssBaseline,
} from '@mui/material';
import FeedbackIcon from '@mui/icons-material/Feedback';
import CommentIcon from '@mui/icons-material/Comment';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { useNavigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';

const drawerWidth = 240;

const Dashboard = () => {
    const [mobileOpen, setMobileOpen] = useState(false);
    const navigate = useNavigate();
    const user = useSelector((state) => state.auth.user);

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const drawer = (
        <div>
            <Toolbar />
            <Divider />
            <List>
                <ListItem button onClick={() => navigate('/dashboard/flagged-messages')}>
                    <ListItemAvatar>
                        <Avatar>
                            <CommentIcon />
                        </Avatar>
                    </ListItemAvatar>
                    <ListItemText primary="Flagged Messages" />
                </ListItem>
                <ListItem button onClick={() => navigate('/dashboard/feedback')}>
                    <ListItemAvatar>
                        <Avatar>
                            <FeedbackIcon />
                        </Avatar>
                    </ListItemAvatar>
                    <ListItemText primary="Feedback" />
                </ListItem>
                <ListItem button onClick={() => navigate('/dashboard/useractivity')}>
                    <ListItemAvatar>
                        <Avatar>
                            <AccountCircleIcon />
                        </Avatar>
                    </ListItemAvatar>
                    <ListItemText primary="User Activity" />
                </ListItem>
                {/* Add other navigation items as needed */}
            </List>
        </div>
    );

    return (
        <Box sx={{ display: 'flex' }}>
            <CssBaseline />
            {/* Mobile Drawer */}
            <Drawer
                variant="temporary"
                open={mobileOpen}
                onClose={handleDrawerToggle}
                ModalProps={{
                    keepMounted: true, // Better open performance on mobile.
                }}
                sx={{
                    display: { xs: 'block', sm: 'none' },
                    '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
                }}
            >
                {drawer}
            </Drawer>
            {/* Permanent Drawer */}
            <Drawer
                variant="permanent"
                sx={{
                    display: { xs: 'none', sm: 'block' },
                    '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
                }}
                open
            >
                {drawer}
            </Drawer>
            {/* Main Content */}
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: 3,
                    ml: { sm: `${drawerWidth}px` }, // Margin-left to prevent overlap
                    backgroundColor: '#f5f5f5',
                    minHeight: '100vh',
                }}
            >
                <Toolbar />
                {/* Render nested routes */}
                <Outlet />
            </Box>
        </Box>
    );
};

export default Dashboard;

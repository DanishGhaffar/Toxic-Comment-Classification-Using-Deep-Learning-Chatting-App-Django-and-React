// src/components/Navbar.js

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../redux/slices/authSlice';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import { hasRole } from '../permissions';

const Navbar = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const auth = useSelector((state) => state.auth);
    const [drawerOpen, setDrawerOpen] = useState(false);

    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
    };

    const toggleDrawer = (open) => (event) => {
        if (
            event.type === 'keydown' &&
            (event.key === 'Tab' || event.key === 'Shift')
        ) {
            return;
        }
        setDrawerOpen(open);
    };

    const drawerList = (
        <Box
            sx={{ width: 250 }}
            role="presentation"
            onClick={toggleDrawer(false)}
            onKeyDown={toggleDrawer(false)}
        >
            <List>
                {auth.user ? (
                    <>
                        <ListItem button component={Link} to="/home">
                            <ListItemText primary="Home" />
                        </ListItem>
                        <ListItem button component={Link} to="/profile">
                            <ListItemText primary="Profile" />
                        </ListItem>
                        {hasRole(auth.user, ['admin', 'moderator']) && (
                            <ListItem button component={Link} to="/dashboard">
                                <ListItemText primary="Dashboard" />
                            </ListItem>
                        )}
                        <ListItem button component={Link} to="/chat">
                            <ListItemText primary="Chat" />
                        </ListItem>
                        <ListItem button onClick={handleLogout}>
                            <ListItemText primary="Logout" />
                        </ListItem>
                    </>
                ) : (
                    <>
                        <ListItem button component={Link} to="/login">
                            <ListItemText primary="Login" />
                        </ListItem>
                        <ListItem button component={Link} to="/register">
                            <ListItemText primary="Register" />
                        </ListItem>
                    </>
                )}
            </List>
            <Divider />
        </Box>
    );

    return (
        <Box sx={{ flexGrow: 1 }}>
            <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
                <Toolbar>
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        edge="start"
                        onClick={toggleDrawer(true)}
                        sx={{ mr: 2, display: { sm: 'none' } }}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        ChatApp
                    </Typography>
                    <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                        {auth.status === 'loading' ? (
                            'Loading'
                        ) : auth.user ? (
                            <>
                                <Button color="inherit" component={Link} to="/home">
                                    Home
                                </Button>
                                <Button color="inherit" component={Link} to="/profile">
                                    Profile
                                </Button>
                                {hasRole(auth.user, ['admin', 'moderator']) && (
                                    <Button color="inherit" component={Link} to="/dashboard">
                                        Dashboard
                                    </Button>
                                )}
                                <Button color="inherit" component={Link} to="/chat">
                                    Chat
                                </Button>
                                <Button color="inherit" onClick={handleLogout}>
                                    Logout
                                </Button>
                            </>
                        ) : (
                            <>
                                <Button color="inherit" component={Link} to="/login">
                                    Login
                                </Button>
                                <Button color="inherit" component={Link} to="/register">
                                    Register
                                </Button>
                            </>
                        )}
                    </Box>
                    <Drawer
                        anchor="left"
                        open={drawerOpen}
                        onClose={toggleDrawer(false)}
                        sx={{ display: { sm: 'none' } }}
                    >
                        {drawerList}
                    </Drawer>
                </Toolbar>
            </AppBar>
        </Box>
    );
};

export default Navbar;

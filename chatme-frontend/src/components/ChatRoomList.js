// src/components/ChatRoomList.js

import React, { useEffect, useState } from 'react';
import API from '../api';
import { useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Box,
    Typography,
    List,
    ListItem,
    ListItemButton,
    ListItemAvatar,
    ListItemText,
    Divider,
    Avatar,
    TextField,
    InputAdornment,
    CircularProgress,
    IconButton,
    Menu,
    MenuItem,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import Badge from '@mui/material/Badge';
import { styled } from '@mui/material/styles';

const OnlineBadge = styled(Badge)(({ theme }) => ({
    '& .MuiBadge-badge': {
        backgroundColor: '#44b700',
        color: '#44b700',
        boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
        '&::after': {
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            animation: 'ripple 1.2s infinite ease-in-out',
            border: '1px solid currentColor',
            content: '""',
        },
    },
    '@keyframes ripple': {
        '0%': {
            transform: 'scale(.8)',
            opacity: 1,
        },
        '100%': {
            transform: 'scale(2.4)',
            opacity: 0,
        },
    },
}));

const OfflineBadge = styled(Badge)(({ theme }) => ({
    '& .MuiBadge-badge': {
        backgroundColor: '#f44336',
        color: '#f44336',
        boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
    },
}));

const ChatRoomList = () => {
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [rooms, setRooms] = useState([]);
    const [filteredRooms, setFilteredRooms] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loadingUsers, setLoadingUsers] = useState(true);
    const [loadingRooms, setLoadingRooms] = useState(true);

    const [menuAnchorEl, setMenuAnchorEl] = useState(null); // For the group menu
    const [selectedRoom, setSelectedRoom] = useState(null); // Room on which menu is opened

    const auth = useSelector((state) => state.auth);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await API.get('all/');
                setUsers(response.data);
                setFilteredUsers(response.data);
            } catch (error) {
                console.error('Error fetching users:', error);
            } finally {
                setLoadingUsers(false);
            }
        };

        const fetchRooms = async () => {
            try {
                const res = await API.get('rooms/');
                setRooms(res.data);
                setFilteredRooms(res.data);
            } catch (error) {
                console.error('Error fetching rooms:', error);
            } finally {
                setLoadingRooms(false);
            }
        };

        fetchUsers();
        fetchRooms();
    }, []);

    useEffect(() => {
        if (searchTerm.trim() === '') {
            setFilteredUsers(users);
            setFilteredRooms(rooms);
        } else {
            const lowercasedTerm = searchTerm.toLowerCase();

            const filteredU = users.filter((user) =>
                user.username.toLowerCase().includes(lowercasedTerm)
            );
            setFilteredUsers(filteredU);

            const filteredR = rooms.filter((room) =>
                room.name.toLowerCase().includes(lowercasedTerm)
            );
            setFilteredRooms(filteredR);
        }
    }, [searchTerm, users, rooms]);

    const startDirectChat = async (otherUser) => {
        const currentUserId = auth.user.id;
        const otherUserId = otherUser.id;
        const roomName = `direct_${Math.min(currentUserId, otherUserId)}_${Math.max(currentUserId, otherUserId)}`;

        try {
            await API.post('rooms/', {
                name: roomName,
                is_group: false,
                other_user_id: otherUserId,
            });
            navigate(`/chat/${roomName}`);
        } catch (err) {
            navigate(`/chat/${roomName}`);
        }
    };

    const openRoom = (room) => {
        navigate(`/chat/${room.name}`);
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const currentRoomName = location.pathname.split('/').pop();

    const groupRooms = filteredRooms.filter((r) => r.is_group === true);

    // Menu Handlers for Groups
    const handleMenuOpen = (event, room) => {
        setMenuAnchorEl(event.currentTarget);
        setSelectedRoom(room);
    };
    const handleMenuClose = () => {
        setMenuAnchorEl(null);
        setSelectedRoom(null);
    };

    const handleDeleteGroup = async (roomId) => {
        try {
            await API.delete(`rooms/${roomId}/`);
            // Remove the deleted room from state
            setRooms((prev) => prev.filter((r) => r.id !== roomId));
            setFilteredRooms((prev) => prev.filter((r) => r.id !== roomId));
            alert('Group deleted successfully!');
        } catch (error) {
            console.error('Error deleting group:', error);
            alert('Failed to delete the group. Please try again.');
        } finally {
            handleMenuClose();
        }
    };

    return (
        <Box
            sx={{
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
            }}
        >
            {/* Header */}
            <Box
                sx={{
                    p: 2,
                    borderBottom: '1px solid #ccc',
                    backgroundColor: '#ffffff',
                }}
            >
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    Chats
                </Typography>
            </Box>

            {/* Search Bar */}
            <Box
                sx={{
                    p: 2,
                    borderBottom: '1px solid #ccc',
                    backgroundColor: '#ffffff',
                }}
            >
                <TextField
                    variant="outlined"
                    size="small"
                    placeholder="Search chats or users..."
                    fullWidth
                    value={searchTerm}
                    onChange={handleSearchChange}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon color="action" />
                            </InputAdornment>
                        ),
                    }}
                />
            </Box>

            {/* Rooms & Users List */}
            <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
                {(loadingUsers || loadingRooms) ? (
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
                ) : (
                    <>
                        {/* Display Groups */}
                        {groupRooms.length > 0 && (
                            <>
                                <Typography variant="subtitle1" sx={{ p: 2 }}>
                                    Groups
                                </Typography>
                                <List>
                                    {groupRooms.map((room) => {
                                        const isActive = room.name === currentRoomName;
                                        return (
                                            <React.Fragment key={room.id}>
                                                <ListItem
                                                    secondaryAction={
                                                        <IconButton
                                                            edge="end"
                                                            aria-label="options"
                                                            onClick={(e) => handleMenuOpen(e, room)}
                                                        >
                                                            <MoreVertIcon />
                                                        </IconButton>
                                                    }
                                                    disablePadding
                                                >
                                                    <ListItemButton
                                                        onClick={() => openRoom(room)}
                                                        selected={isActive}
                                                    >
                                                        <ListItemAvatar>
                                                            <Avatar sx={{ width: 40, height: 40 }}>
                                                                {room.name.charAt(0).toUpperCase()}
                                                            </Avatar>
                                                        </ListItemAvatar>
                                                        <ListItemText
                                                            primary={room.name}
                                                            sx={{
                                                                ml: 2,
                                                                whiteSpace: 'nowrap',
                                                                overflow: 'hidden',
                                                                textOverflow: 'ellipsis',
                                                            }}
                                                        />
                                                    </ListItemButton>
                                                </ListItem>
                                                <Divider component="li" />
                                            </React.Fragment>
                                        );
                                    })}
                                </List>
                            </>
                        )}

                        {/* Display Users as Direct Chats */}
                        <Typography variant="subtitle1" sx={{ p: 2 }}>
                            Users
                        </Typography>
                        {filteredUsers.length === 0 ? (
                            <Typography variant="body1" color="textSecondary" align="center" sx={{ mt: 2 }}>
                                No users found.
                            </Typography>
                        ) : (
                            <List>
                                {filteredUsers.map((user) => {
                                    const roomName = `direct_${Math.min(auth.user.id, user.id)}_${Math.max(auth.user.id, user.id)}`;
                                    const isActive = roomName === currentRoomName;
                                    return (
                                        <React.Fragment key={user.id}>
                                            <ListItem disablePadding>
                                                <ListItemButton
                                                    onClick={() => startDirectChat(user)}
                                                    selected={isActive}
                                                >
                                                    <ListItemAvatar>
                                                        {user.is_online ? (
                                                            <OnlineBadge
                                                                overlap="circular"
                                                                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                                                                variant="dot"
                                                            >
                                                                <Avatar
                                                                    src={user.image_url || '/static/images/default_avatar.png'}
                                                                    alt={user.username}
                                                                    sx={{ width: 40, height: 40 }}
                                                                />
                                                            </OnlineBadge>
                                                        ) : (
                                                            <OfflineBadge
                                                                overlap="circular"
                                                                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                                                                variant="dot"
                                                            >
                                                                <Avatar
                                                                    src={user.image_url || '/static/images/default_avatar.png'}
                                                                    alt={user.username}
                                                                    sx={{ width: 40, height: 40 }}
                                                                />
                                                            </OfflineBadge>
                                                        )}
                                                    </ListItemAvatar>
                                                    <ListItemText
                                                        primary={user.username}
                                                        sx={{
                                                            ml: 2,
                                                            whiteSpace: 'nowrap',
                                                            overflow: 'hidden',
                                                            textOverflow: 'ellipsis',
                                                        }}
                                                    />
                                                </ListItemButton>
                                            </ListItem>
                                            <Divider component="li" />
                                        </React.Fragment>
                                    );
                                })}
                            </List>
                        )}
                    </>
                )}
            </Box>

            {/* Menu for Groups */}
            <Menu
                anchorEl={menuAnchorEl}
                open={Boolean(menuAnchorEl)}
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
                <MenuItem onClick={() => handleDeleteGroup(selectedRoom.id)}>Delete Group</MenuItem>
            </Menu>
        </Box>
    );
};

export default ChatRoomList;

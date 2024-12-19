// src/components/UserList.js
import React, { useEffect, useState } from 'react';
import API from '../api';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

const UserList = () => {
    const [users, setUsers] = useState([]);
    const auth = useSelector(state => state.auth);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUsers = async () => {
            const response = await API.get('users/all/');
            setUsers(response.data);
        };
        fetchUsers();
    }, []);

    const startDirectChat = async (otherUser) => {
        const currentUserId = auth.user.id; 
        const otherUserId = otherUser.id;
        const roomName = `direct_${Math.min(currentUserId, otherUserId)}_${Math.max(currentUserId, otherUserId)}`;

        try {
            // Attempt to create the room
            await API.post('rooms/', {
                name: roomName,
                is_group: false,
                other_user_id: otherUserId
            });
            // Room created, navigate
            navigate(`/chat/${roomName}`);
        } catch (err) {
            // If error means room may already exist
            // Just navigate to that room
            navigate(`/chat/${roomName}`);
        }
    };

    return (
        <div style={{ width: '200px', borderRight: '1px solid #ccc', padding: '10px' }}>
            <h3>Users</h3>
            <ul style={{ listStyle: 'none', padding: 0 }}>
                {users.map(user => (
                    <li key={user.id} style={{ marginBottom: '8px', cursor: 'pointer' }} onClick={() => startDirectChat(user)}>
                        {user.username}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default UserList;

// src/pages/Dashboard.jsx

import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../AuthContext';
import axios from 'axios';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { authTokens } = useContext(AuthContext);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetchUsers();
  }, [authTokens]);

  const fetchUsers = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/users/', {
        headers: {
          'Authorization': `Bearer ${authTokens.access}`,
        },
      });
      setUsers(response.data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  return (
    <div>
      <h2>Users</h2>
      <ul>
        {users.map((user) => (
          <li key={user.id}>
            <Link to={`/chat/${user.username}`}>{user.username}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Dashboard;

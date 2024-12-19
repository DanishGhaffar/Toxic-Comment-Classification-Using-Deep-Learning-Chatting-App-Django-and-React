// src/pages/ChatPage.jsx

import React, { useEffect, useState, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { AuthContext } from '../AuthContext';

const ChatPage = () => {
  const { username } = useParams();
  const { authTokens, user } = useContext(AuthContext);
  const [messages, setMessages] = useState([]);
  const [content, setContent] = useState('');
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const chatSocket = new WebSocket(
      `ws://${window.location.host}/ws/chat/${username}/?token=${authTokens.access}`
    );

    chatSocket.onmessage = function (e) {
      const data = JSON.parse(e.data);
      setMessages((prevMessages) => [...prevMessages, data]);
    };

    chatSocket.onclose = function (e) {
      console.error('Chat socket closed unexpectedly');
    };

    setSocket(chatSocket);

    return () => {
      chatSocket.close();
    };
  }, [authTokens, username]);

  const sendMessage = () => {
    if (content.trim() !== '') {
      socket.send(JSON.stringify({ message: content }));
      setContent('');
    }
  };

  return (
    <div>
      <h2>Chat with {username}</h2>
      <div>
        <input
          type="text"
          value={content}
          placeholder="Type your message..."
          onChange={(e) => setContent(e.target.value)}
        />
        <button onClick={sendMessage}>Send</button>
      </div>
      <ul>
        {messages.map((msg, index) => (
          <li key={index}>
            <strong>{msg.sender === user.username ? 'You' : msg.sender}:</strong> {msg.message}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ChatPage;

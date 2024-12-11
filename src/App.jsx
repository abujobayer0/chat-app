import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import './App.css';

const socket = io('http://localhost:8000');

const App = () => {
  const [messages, setMessages] = useState([]);
  const [username, setUsername] = useState('');
  const [content, setContent] = useState('');
  const [typingUser, setTypingUser] = useState('');

  useEffect(() => {
    // Fetch messages from the server
    axios.get('http://localhost:8000/api/messages').then((res) => {
      setMessages(res.data);
    });

    // Listen for new messages
    socket.on('new-message', (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    // Listen for typing status
    socket.on('typing', (user) => {
      setTypingUser(user);
      setTimeout(() => setTypingUser(''), 2000); // Clear after 2 seconds
    });

    return () => {
      socket.off('new-message');
      socket.off('typing');
    };
  }, []);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (username && content) {
      await axios.post('http://localhost:8000/api/messages', { username, content });
      setContent('');
    }
  };

  const handleTyping = () => {
    if (username) {
      socket.emit('typing', username);
    }
  };

  return (
    <div className="chat-container">
      <h1 className="chat-title">Messenger App</h1>
      <div className="chat-box">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`chat-message ${username === msg.username ? 'sent' : 'received'}`}
          >
            <div className="message-content">
              <strong className="message-user">{msg.username}</strong>
              <p>{msg.content}</p>
            </div>
            <div className="message-status">
              {msg.delivered && <span className="delivered">✓ Delivered</span>}
              {msg.seenBy?.includes(username) && <span className="seen">✓ Seen</span>}
            </div>
          </div>
        ))}
        {typingUser && <p className="typing-status">{typingUser} is typing...</p>}
      </div>
      <form onSubmit={sendMessage} className="chat-form">
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="chat-input username"
        />
        <input
          type="text"
          placeholder="Type a message..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyPress={handleTyping}
          className="chat-input message"
        />
        <button type="submit" className="chat-button">Send</button>
      </form>
    </div>
  );
};

export default App;
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';

const socket = io('https://chat-server-fksr.onrender.com');

const App = () => {
  const [messages, setMessages] = useState([]);
  const [username, setUsername] = useState('');
  const [content, setContent] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Check if username is saved in localStorage, if not, ask for it
    const storedUsername = localStorage.getItem('username');
    if (storedUsername) {
      setUsername(storedUsername);
    } else {
      const userNameFromAlert = prompt("Please enter your username:");
      if (userNameFromAlert) {
        setUsername(userNameFromAlert);
        localStorage.setItem('username', userNameFromAlert);
      }
    }


    // Fetch messages from the server
    axios.get('https://chat-server-fksr.onrender.com/api/messages').then((res) => {
      setMessages(res.data);
    });

    // Listen for new messages
    socket.on('new-message', (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);


    });

    return () => {
      socket.off('new-message');
    };
  }, []);

  // Scroll to the bottom whenever messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (username && content) {
      await axios.post('https://chat-server-fksr.onrender.com/api/messages', { username, content });
      setContent('');
    }
  };

  return (
    <div
      style={{
        padding: '10px',
        paddingBottom: "100px",
        fontFamily: 'Arial, sans-serif',
        minWidth: '100vw',
        minHeight: '100vh',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box',
        backgroundColor: '#f5f5f5',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          width: '100%',
          alignItems: 'center',
          padding: '10px',
          borderBottom: '1px solid #ddd',
          backgroundColor: '#fff',
        }}
      >
        <h1 style={{ fontSize: '18px', margin: 0 }}>Chat</h1>
        <span style={{ fontSize: '14px', color: '#007BFF' }}>Online</span>
      </div>
      <div
        style={{
          flexGrow: 1,
          padding: '10px',
          overflowY: 'scroll',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
        }}
      >
        {messages.map((msg, index) => (
          <div
            key={index}
            style={{
              display: 'flex',
              flexDirection: username === msg.username ? 'row-reverse' : 'row',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <div
              style={{
                backgroundColor: username === msg.username ? '#007BFF' : '#e0e0e0',
                color: username === msg.username ? 'white' : 'black',
                padding: '10px',
                borderRadius: '20px',
                maxWidth: '70%',
                wordBreak: 'break-word',
                textAlign: username === msg.username ? 'right' : 'left',
              }}
            >
              <strong>{msg.username}</strong>
              <p style={{ margin: 0, fontSize: '14px' }}>{msg.content}</p>
            </div>
          </div>
        ))}
        {/* Reference to the last message for scrolling */}
        <div ref={messagesEndRef} />
      </div>
      <form
        onSubmit={sendMessage}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '10px',
          borderTop: '1px solid #ddd',
          backgroundColor: '#fff',
        }}
      >
        <input
          type="text"
          placeholder="Message"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          style={{
            padding: '10px',
            borderRadius: '20px',
            border: '1px solid #ccc',
            flexGrow: 2,
            outline: 'none',
            fontSize: '14px',
          }}
        />
        <button
          type="submit"
          style={{
            padding: '10px 15px',
            backgroundColor: '#007BFF',
            color: 'white',
            border: 'none',
            borderRadius: '20px',
            fontSize: '14px',
            cursor: 'pointer',
          }}
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default App;

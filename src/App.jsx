import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import dayjs from "dayjs";
import { FaPaperPlane } from "react-icons/fa";
import { IoCheckmarkDone, IoCheckmark } from "react-icons/io5";
import { motion } from "framer-motion";

const baseURI = import.meta.env.VITE_BASE_URI;

const socket = io(baseURI);

const App = () => {
  const [messages, setMessages] = useState([]);
  const [username, setUsername] = useState("");
  const [content, setContent] = useState("");
  const [typing, setTyping] = useState(false);
  const [typingUsername, setTypingUsername] = useState("");
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  useEffect(() => {
    const storedUsername = localStorage.getItem("usernameC");
    if (storedUsername) {
      setUsername(storedUsername);
    } else {
      const userNameFromAlert = prompt("Please enter your username:");
      if (userNameFromAlert) {
        setUsername(userNameFromAlert);
        localStorage.setItem("usernameC", userNameFromAlert);
      }
    }

    axios.get(`${baseURI}/api/messages`).then((res) => {
      setMessages(res.data);
    });

    socket.emit("set-username", username);
    socket.on("new-message", (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    socket.on("typing", (username) => {
      setTyping(true);
      setTypingUsername(username);
    });
    socket.on("online-users", (users) => {
      setOnlineUsers(users);
    });
    socket.on("message-seen", ({ messageId, username }) => {
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg._id === messageId
            ? { ...msg, seenBy: [...msg.seenBy, username] }
            : msg
        )
      );
    });

    return () => {
      socket.off("new-message");
      socket.off("typing");
      socket.off("online-users");
      socket.off("message-seen");
    };
  }, []);
  useEffect(() => {
    if (messages.length > 0) {
      messages.forEach((message) => {
        if (!message.seenBy.includes(username)) {
          socket.emit("mark-as-seen", { messageId: message._id, username });
        }
      });
    }
  }, [messages]);
  console.log(onlineUsers);
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, typingUsername]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (username && content) {
      await axios.post(`${baseURI}/api/messages`, {
        username,
        content,
      });
      setContent("");
      socket.emit("typing", "");
    }
  };

  const handleTyping = () => {
    if (content) {
      socket.emit("typing", username);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit("typing", "");
      }, 2000);
    } else {
      socket.emit("typing", "");
    }
  };

  const styles = {
    container: {
      display: "flex",
      flexDirection: "column",
      minHeight: "100vh",
      minWidth: "100vw",
      backgroundColor: "#ffe4e1",
      fontFamily: "'Akaya Kanadaka', system-ui",
      padding: "10px",
      boxSizing: "border-box",
    },
    header: {
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      paddingBottom: "15px",
      backgroundColor: "#fff",
      borderBottom: "2px solid #f5c6cb", // Light pink border
      zIndex: 10,
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "10px 15px",
    },
    headerTitle: {
      fontSize: "28px",
      fontWeight: "600",
      margin: 0,
      color: "#e91e63", // Romantic pink
    },
    onlineStatus: {
      fontSize: "14px",
      color: "#34b7f1", // Blue for balance
      fontWeight: "400",
    },
    messagesContainer: {
      flexGrow: 1,
      marginTop: "70px", // Add space for the fixed header
      padding: "10px 0",
      overflowY: "auto",
      display: "flex",
      flexDirection: "column",
      gap: "10px",
      paddingBottom: "70px", // Add space for the fixed input box
    },
    messageWrapper: {
      display: "flex",
      flexDirection: "row",
      alignItems: "flex-start",
      gap: "10px",
    },
    messageBox: {
      backgroundColor: "#f8bbd0", // Soft pink
      color: "#000",
      padding: "2px 4px",
      borderRadius: "15px",
      maxWidth: "75%",
      wordBreak: "break-word",
      textAlign: "left",
      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
      fontSize: "14px",
      transition: "transform 0.3s ease-in-out",
    },
    senderBox: {
      backgroundColor: "#f53679",
      color: "#fff",
      textAlign: "right",
    },
    time: {
      fontSize: "10px",
    },
    typingIndicator: {
      fontStyle: "italic",
      color: "rgba(0, 0, 0, 0.7)",
      fontSize: "12px",
    },
    inputWrapper: {
      position: "fixed",
      bottom: 0,
      left: 0,
      right: 0,
      display: "flex",
      alignItems: "center",
      gap: "10px",
      borderTop: "1px solid #f5c6cb",
      padding: "15px",
      backgroundColor: "#fff",
      zIndex: 10,
    },
    inputField: {
      flexGrow: 1,
      padding: "10px 15px",
      borderRadius: "20px",
      border: "1px solid #f5c6cb",
      fontSize: "14px",
      outline: "none",
      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
      backgroundColor: "#fff",
      color: "#000",
    },
    sendButton: {
      padding: "10px 15px",
      backgroundColor: "#e91e63",
      color: "#fff",
      border: "none",
      borderRadius: "20px",
      fontSize: "14px",
      cursor: "pointer",
      boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)",
      transition: "0.3s ease-in-out",
    },
    sendButtonHover: {
      backgroundColor: "#d81b60", // Darker pink
    },
    avatar: {
      width: "30px",
      height: "30px",
      borderRadius: "50%",
      backgroundColor: "#f48fb1", // Soft pink avatar
      color: "#fff",
      fontSize: "14px",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
    },
    seenIndicator: {
      fontSize: "12px",
      color: "rgba(0, 0, 0, 0.5)",
    },
  };
  // Animation for new messages using framer-motion
  const messageAnimation = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, ease: "easeOut" },
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.headerTitle}>Thhuuu</h1>
        <span style={styles.onlineStatus}>
          Online Users: {onlineUsers.join(", ")}
        </span>
      </div>

      {/* Messages */}
      <div style={styles.messagesContainer}>
        {messages.map((message, index) => (
          <motion.div
            key={message._id || index}
            style={{
              ...styles.messageWrapper,
              flexDirection:
                username === message.username ? "row-reverse" : "row",
            }}
            {...messageAnimation}
          >
            <div style={styles.avatar}>{message.username[0]}</div>
            <div
              style={{
                ...styles.messageBox,
                ...(username === message.username ? styles.senderBox : {}),
              }}
            >
              <p style={{ margin: "8px 0", fontSize: "14px", padding: "5px" }}>
                {message.content}
              </p>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                alignItems: "center",
              }}
            >
              <span
                style={{
                  ...styles.time,
                  color: "rgba(0,0,0,0.5)",
                }}
              >
                {dayjs(message.timestamp).format("HH:mm:ss")}
              </span>
              <div style={styles.seenIndicator}>
                {username === message.username &&
                  (message.seenBy.length > 1 ? (
                    <IoCheckmarkDone color="#34b7f1" />
                  ) : (
                    <IoCheckmark />
                  ))}
              </div>
            </div>
          </motion.div>
        ))}
        <div ref={messagesEndRef}></div>
        {typing && typingUsername && (
          <p style={styles.typingIndicator} className="typing-indicator">
            {typingUsername} is typing... 💌
          </p>
        )}
      </div>

      {/* Input Area */}
      <form onSubmit={sendMessage} style={styles.inputWrapper}>
        <input
          type="text"
          placeholder="Type a message..."
          value={content}
          onChange={(e) => {
            setContent(e.target.value);
            handleTyping();
          }}
          style={styles.inputField}
        />
        <button
          type="submit"
          onClick={sendMessage}
          style={styles.sendButton}
          onMouseEnter={(e) =>
            (e.target.style.backgroundColor =
              styles.sendButtonHover.backgroundColor)
          }
          onMouseLeave={(e) =>
            (e.target.style.backgroundColor = styles.sendButton.backgroundColor)
          }
        >
          <FaPaperPlane />
        </button>
      </form>
    </div>
  );
};

export default App;

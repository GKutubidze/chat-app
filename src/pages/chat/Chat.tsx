import React, { useEffect, useState } from "react";
import io, { Socket } from "socket.io-client";
import axios from "axios";
import styles from "./Chat.module.css";
import { LoaderData, Message, User, FriendRequest } from "../../Types/Types";
import useAuth from "../../context/AuthContext";
import Messages from "../../components/Messages/Messages";
import { useLoaderData } from "react-router-dom";

const serverUrl = import.meta.env.VITE_SERVER_URL;

const socket: Socket = io(serverUrl, {
  withCredentials: true,
});

const Chat: React.FC = () => {
  const { user } = useLoaderData() as LoaderData;
  const { logout } = useAuth();
  const [message, setMessage] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [search, setSearch] = useState<string>("");
  const [users, setUsers] = useState<User[]>([]);
  // const [friends, setFriends] = useState<User[]>(initialFriends);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newMessage, setNewMessage] = useState<Message | null>(null);
  console.log(newMessage?.sender);

  useEffect(() => {
    if (user) {
      axios
        .get<{
          incomingRequests: FriendRequest[];
          outgoingRequests: FriendRequest[];
        }>(`${serverUrl}/api/users/friendRequests`)
        .then((res) => setFriendRequests(res.data.incomingRequests));
    }
  }, [user]);

  useEffect(() => {
    if (user && selectedUser) {
      axios
        .get<Message[]>(
          `${serverUrl}/api/messages/${user._id}/${selectedUser._id}`
        )
        .then((res) => setMessages(res.data));

      socket.emit("joinRoom", {
        userId: user._id,
        selectedUserId: selectedUser._id,
      });
    }
  }, [user, selectedUser]);

  useEffect(() => {
    if (user) {
      const handleMessage = (message: Message) => {
        setMessages((prevMessages) => [...prevMessages, message]);
      };

      const handleNotification = (newMessage: Message) => {
        if (newMessage.receiver === user._id) {
          setNewMessage(newMessage);
          // console.log("New message received:", newMessage); // Check if this logs correctly
        }
      };

      socket.on("receiveMessage", handleMessage);
      socket.on("notification", handleNotification);

      return () => {
        socket.off("receiveMessage", handleMessage);
        socket.off("notification", handleNotification);
      };
    }
  }, [user]);

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message || !user || !selectedUser) {
      console.log("Message, user, or selectedUser is missing.");
      return;
    }

    const senderId = user._id;
    const receiverId = selectedUser._id;

    const newMessage = {
      sender: senderId,
      receiver: receiverId,
      message,
      timestamp: new Date(),
    };

    socket.emit("sendMessage", newMessage);
    setMessage("");
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await axios.get<User[]>(`${serverUrl}/api/users/search`, {
      params: { query: search },
    });
    setUsers(res.data);
  };

  const sendFriendRequest = async (recipientId: string) => {
    try {
      await axios.post(`${serverUrl}/api/users/sendFriendRequest`, {
        requesterId: user._id,
        recipientId: recipientId,
      });
      console.log("Friend request sent");
    } catch (error) {
      console.error("Error sending friend request:", error);
    }
  };

  const acceptFriendRequest = async (requestId: string) => {
    await axios.post(`${serverUrl}/api/users/acceptFriendRequest`, {
      requestId,
    });
    const updatedFriendRequests = friendRequests.filter(
      (req) => req._id !== requestId
    );
    setFriendRequests(updatedFriendRequests);
    // Optionally, refetch friends from the server or update friends state
  };

  const declineFriendRequest = async (requestId: string) => {
    await axios.post(`${serverUrl}/api/users/declineFriendRequest`, {
      requestId,
    });
    const updatedFriendRequests = friendRequests.filter(
      (req) => req._id !== requestId
    );
    setFriendRequests(updatedFriendRequests);
  };

  return (
    <div className={styles.container}>
      <div className={styles.sidebar}>
        <div className={styles.header}>
          <h2>ChatApp</h2>
          <button onClick={logout} className={styles.logoutButton}>
            Log out
          </button>
        </div>
        <form onSubmit={handleSearch} className={styles.searchForm}>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={styles.searchInput}
            placeholder="Search users..."
          />
          <button type="submit" className={styles.searchButton}>
            Search
          </button>
        </form>
        <div className={styles.userList}>
          {users.map((user) => (
            <div
              key={user._id}
              className={`${styles.user} ${
                selectedUser?._id === user._id ? styles.selectedUser : ""
              }`}
              onClick={() => setSelectedUser(user)}
            >
              <div className={styles.avatar}>
                {user.username.charAt(0).toUpperCase()}
              </div>
              <div className={styles.userInfo}>
                <div className={styles.username}>{user.username}</div>
                <div className={styles.email}>{user.email}</div>
              </div>
              <button onClick={() => sendFriendRequest(user._id)}>
                Add Friend
              </button>
            </div>
          ))}
        </div>

        <div className={styles.friendRequestList}>
          <h3>Friend Requests</h3>
          {friendRequests.map((request) => (
            <div key={request._id} className={styles.friendRequest}>
              <span>{request.requester.username}</span>
              <button onClick={() => acceptFriendRequest(request._id)}>
                Accept
              </button>
              <button onClick={() => declineFriendRequest(request._id)}>
                Decline
              </button>
            </div>
          ))}
        </div>
      </div>
      {newMessage && (
        <div className={styles.newMessageNotification}>
          <span className={styles.notificationBadge}>
            New message from {newMessage.sender}
          </span>
        </div>
      )}
      <div className={styles.chatBox}>
        <div className={styles.chatHeader}>
          {selectedUser ? (
            <div className={styles.chatUserInfo}>
              <div className={styles.avatarLarge}>
                {selectedUser.username.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className={styles.chatUsername}>
                  {selectedUser.username}
                </div>
                <div className={styles.chatEmail}>{selectedUser.email}</div>
              </div>
            </div>
          ) : (
            <div className={styles.noUserSelected}>
              Select a user to start chatting
            </div>
          )}
        </div>

        <Messages messages={messages} />
        {selectedUser && (
          <form onSubmit={sendMessage} className={styles.form}>
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className={styles.input}
              placeholder="Type a message..."
            />
            <button type="submit" className={styles.button}>
              Send
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Chat;

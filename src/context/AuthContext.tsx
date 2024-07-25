import React, {
  createContext,
  useState,
  useEffect,
  ReactNode,
  useContext,
} from "react";
import axios from "axios";
import { User } from "../Types/Types";
import { redirect } from "react-router-dom";

interface AuthContextProps {
  isAuthenticated: boolean;
  loading: boolean;
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (
    firstname: string,
    surname: string,
    username: string,
    email: string,
    password: string
  ) => Promise<void>;
  getUser: (query: string) => Promise<User | null>;
  friends: User[];
  fetchFriends: () => Promise<void>;
  addFriend: (friendId: string) => Promise<void>;
  removeFriend: (friendId: string) => Promise<void>;
}

export const AuthContext = createContext<AuthContextProps | undefined>(
  undefined
);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [friends, setFriends] = useState<User[]>([]);

  const apiUrl = "http://localhost:5000";

  axios.defaults.withCredentials = true;

  const fetchCurrentUser = async () => {
    try {
      console.log("Fetching current user...");
      const response = await axios.get(`${apiUrl}/api/auth/current`);
      console.log("Current user response:", response.data);
      setUser(response.data.user);
      setIsAuthenticated(true);
    } catch (error) {
      console.error("Error fetching current user:", error);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);
  const login = async (email: string, password: string) => {
    try {
      await axios.post(`${apiUrl}/api/auth/login`, { email, password });
      await fetchCurrentUser();
      redirect("/chat");
    } catch (error) {
      console.error("Error logging in:", error);
      throw error; // Allow the error to propagate
    }
  };
  const getUser = async (query: string): Promise<User | null> => {
    try {
      const response = await axios.get(`${apiUrl}/api/users/search`, {
        params: { query },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching user:", error);
      return null;
    }
  };
  const logout = async () => {
    try {
      await axios.post(`${apiUrl}/api/auth/logout`);
      setIsAuthenticated(false);
      setUser(null);
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };
  const fetchFriends = async () => {
    if (user) {
      try {
        const response = await axios.get(
          `${apiUrl}/api/users/list/${user._id}`
        );
        setFriends(response.data);
      } catch (error) {
        console.error("Error fetching friends:", error);
      }
    }
  };

  const addFriend = async (friendId: string) => {
    if (user) {
      try {
        await axios.post(`${apiUrl}/api/users/add`, {
          userId: user._id,
          friendId,
        });
        fetchFriends(); // Update the friends list after adding
      } catch (error) {
        console.error("Error adding friend:", error);
      }
    }
  };

  const removeFriend = async (friendId: string) => {
    if (user) {
      try {
        await axios.post(`${apiUrl}/api/users/remove`, {
          userId: user._id,
          friendId,
        });
        fetchFriends(); // Update the friends list after removing
      } catch (error) {
        console.error("Error removing friend:", error);
      }
    }
  };
  const register = async (
    firstname: string,
    surname: string,
    username: string,
    email: string,
    password: string
  ) => {
    try {
      await axios.post(`${apiUrl}/api/auth/register`, {
        firstname,
        surname,
        username,
        email,
        password,
      });
    } catch (error) {
      console.error("Error registering:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        loading,
        user,
        login,
        logout,
        register,
        getUser,
        friends,
        fetchFriends,
        addFriend,
        removeFriend,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default useAuth;

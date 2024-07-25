import React from "react";
import {
  createBrowserRouter,
  redirect,
  RouterProvider,
} from "react-router-dom";
import ProtectedRoute from "../utils/ProtectedRoute";
import App from "../App";
import Register from "../pages/register/Register";
import Chat from "../pages/chat/Chat";
import axios from "axios";
import { User } from "../Types/Types";
const apiUrl = "http://localhost:5000";

interface InitialData {
  user: User;
  friends: User[];
}
const fetchInitialData = async (): Promise<InitialData> => {
  try {
    const userResponse = await axios.get<{ user: User }>(
      `${apiUrl}/api/auth/current`,
      {
        withCredentials: true,
      }
    );
    const userId = userResponse.data.user._id;
    const friendsResponse = await axios.get<User[]>(
      `${apiUrl}/api/users/list/${userId}`,
      {
        withCredentials: true,
      }
    );

    return {
      user: userResponse.data.user,
      friends: friendsResponse.data,
    };
  } catch (error) {
    console.error("Error fetching initial data:", error);
    throw redirect("/login");
  }
};

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
  },

  {
    path: "/register",
    element: (
      <ProtectedRoute>
        <Register />
      </ProtectedRoute>
    ),
  },
  {
    path: "/chat",
    element: (
      <ProtectedRoute>
        <Chat />
      </ProtectedRoute>
    ),
    loader: fetchInitialData,
  },
]);

const AppRouter: React.FC = () => {
  return <RouterProvider router={router} />;
};

export default AppRouter;

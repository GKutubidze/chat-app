import React from "react";
import useAuth from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

interface ProtectedRouteProps {
  children: JSX.Element;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  if (!isAuthenticated || !user) {
    navigate("/");
  }

  return children;
};

export default ProtectedRoute;

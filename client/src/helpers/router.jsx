import React from "react";
import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";

export const PrivateRoute = ({ children }) => {
  const { accessToken } = useSelector((state) => state.auth);

  return accessToken ? <Outlet /> : <Navigate to="/" />;
};

export const PublicRoute = ({ children }) => {
  const { accessToken, user } = useSelector((state) => state.auth);

  if (accessToken && user) {
    return <Navigate to="/dashboard" />;
  }

  return <Outlet />;
};

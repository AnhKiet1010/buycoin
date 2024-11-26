import React from "react";
import { useSelector } from "react-redux";
import { Redirect, Route } from "react-router-dom";

export const PrivateRoute = ({ component: Component, ...rest }) => {
  const { accessToken } = useSelector((state) => state.auth);
  return (
    <Route
      {...rest}
      render={(props) => {
        if (accessToken) {
          return <Component {...props} />;
        } else {
          return <Redirect to={{ pathname: "/" }} />;
        }
      }}
    />
  );
};

export const PublicRoute = ({ component: Component, ...rest }) => {
  const { accessToken, user } = useSelector((state) => state.auth);
  return (
    <Route
      {...rest}
      render={(props) => {
        if (accessToken) {
          if (user) {
            <Redirect to={{ pathname: "/dashboard" }} />;
          }
        } else {
          return <Component {...props} />;
        }
      }}
    />
  );
};

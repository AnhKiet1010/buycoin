import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/auth";

const rootReducer = {
  auth: authReducer,
};
const store = configureStore({
  reducer: rootReducer,
});

export default store;

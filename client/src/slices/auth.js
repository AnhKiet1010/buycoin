import { createSlice } from "@reduxjs/toolkit";

const initialUserLocalStorage = localStorage.getItem("user");
const defaultInitialState = {};
if (initialUserLocalStorage) {
  const initialUser = JSON.parse(initialUserLocalStorage);
  if (initialUser.accessToken) {
    Object.assign(defaultInitialState, { accessToken: initialUser.accessToken });
  }
}
const auth = createSlice({
  name: "auth",
  initialState: defaultInitialState,
  reducers: {
    LOGIN: (state, action) => {
      Object.assign(state, action.payload);
      localStorage.setItem("user", JSON.stringify(action.payload));
    },
    LOGOUT: (state, action) => {
      Object.assign(state, {});
      localStorage.removeItem("user");
      return {};
    },
  },
});

const { reducer, actions } = auth;
export const { LOGIN, LOGOUT } = actions;
export default reducer;

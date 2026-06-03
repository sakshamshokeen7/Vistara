import { createSlice } from "@reduxjs/toolkit";

const access = localStorage.getItem("access");
const refresh = localStorage.getItem("refresh");
const email = localStorage.getItem("email");
const role = localStorage.getItem("role");

const authSlice = createSlice({
  name: "auth",
  initialState: {
    isAuthenticated: !!access,
    email: email || null,
    role: role || null,
  },
  reducers: {
    loginSuccess: (state, action) => {
      localStorage.setItem("access", action.payload.access);
      localStorage.setItem("refresh", action.payload.refresh);
      localStorage.setItem("email", action.payload.email);
      if (action.payload.role) {
        localStorage.setItem("role", action.payload.role);
        state.role = action.payload.role;
      }

      state.isAuthenticated = true;
      state.email = action.payload.email;
    },
    setRole: (state, action) => {
      if (action.payload) {
        localStorage.setItem("role", action.payload);
        state.role = action.payload;
      }
    },
    logout: (state) => {
      localStorage.clear();
      state.isAuthenticated = false;
      state.email = null;
      state.role = null;
    },
  },
});

export const { loginSuccess, logout, setRole } = authSlice.actions;
export default authSlice.reducer;

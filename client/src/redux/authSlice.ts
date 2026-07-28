import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface AuthState {
  token: string | null;
  user: { name: string; email: string } | null;
}

const savedUser = localStorage.getItem("learnai_user");
let parsedUser = null;
if (savedUser) {
  try {
    parsedUser = JSON.parse(savedUser);
  } catch (e) {
    localStorage.removeItem("learnai_user");
  }
}

const initialState: AuthState = {
  token: localStorage.getItem("learnai_token"),
  user: parsedUser
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials(state, action: PayloadAction<AuthState>) {
      state.token = action.payload.token;
      state.user = action.payload.user;
      if (action.payload.token) {
        localStorage.setItem("learnai_token", action.payload.token);
      }
      if (action.payload.user) {
        localStorage.setItem("learnai_user", JSON.stringify(action.payload.user));
      }
    },
    logout(state) {
      state.token = null;
      state.user = null;
      localStorage.removeItem("learnai_token");
      localStorage.removeItem("learnai_user");
    }
  }
});

export const { logout, setCredentials } = authSlice.actions;
export default authSlice.reducer;



import { createContext, useContext, useEffect, useState } from "react";
import {
  getCurrentUser,
  loginUser,
  registerUser,
  logoutUser,
} from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check whether a user already has an active session
  useEffect(() => {
    async function checkSession() {
      try {
        const data = await getCurrentUser();
        setUser(data.user);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    checkSession();
  }, []);

  async function signup(full_name, email, password) {
    const data = await registerUser(full_name, email, password);
    setUser(data.user);
    return data;
  }

  async function login(email, password) {
    const data = await loginUser(email, password);
    setUser(data.user);
    return data;
  }

  async function logout() {
    await logoutUser();
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{ user, loading, signup, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}

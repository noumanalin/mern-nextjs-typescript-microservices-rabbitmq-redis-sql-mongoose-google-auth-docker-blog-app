"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { AppProviderProps, AppContextType, User } from "@/types/next";
import axios from "axios";
import { ToastContainer } from "react-toastify";
import { GoogleOAuthProvider } from "@react-oauth/google";
import Cookies from "js-cookie";

export const user_service = "http://localhost:8000";
export const author_service = "http://localhost:8001";
export const blog_service = "http://localhost:8002";

export const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuth, setIsAuth] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    try {
      const token = Cookies.get("token");
      if (!token) return setLoading(false);

      const { data } = await axios.get(`${user_service}/api/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setUser(data.user);
      setIsAuth(true);
    } catch (error) {
      setUser(null);
      setIsAuth(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const value = { user, isAuth, setIsAuth, loading, setLoading };

  return (
    <AppContext.Provider value={value}>
      <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!}>
        {children}
        <ToastContainer position="top-center" draggable pauseOnHover />
      </GoogleOAuthProvider>
    </AppContext.Provider>
  );
};

export const useAppData = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppData must be used within AppProvider");
  }
  return context;
};

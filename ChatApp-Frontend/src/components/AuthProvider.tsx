import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useEffect, useMemo, useState } from "react";

type AuthContextType = {
  userId: string | null;
  isLoading: boolean;
  displayName?: string | null;
  signUp: (id: string) => Promise<void>;
  signOut: () => Promise<void>;
};
export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);
export const USER_ID_KEY = "userId"; // saved name on AsynchStorage
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setLoading] = useState<boolean>(true);
  const [displayName, setDisplayName] = useState<string | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedId = await AsyncStorage.getItem(USER_ID_KEY);
        setUserId(storedId);
        // Try to load displayName from storage (or set default)
        const storedName = await AsyncStorage.getItem("displayName");
        setDisplayName(storedName || null);
      } catch (error) {
        console.warn("Error restored userId/displayName", error);
      } finally {
        setTimeout(() => {
          setLoading(false);
        }, 4000);
      }
    };
    loadUser();
  }, []);

  const signUp = async (id: string) => {
  await AsyncStorage.setItem(USER_ID_KEY, id);
  setUserId(id);
  // Optionally set displayName here if available
  };

  const signOut = async () => {
    await AsyncStorage.removeItem(USER_ID_KEY);
    setUserId(null);
  };

  // when calling this hook if dependencies are changed otherwise it get previous data
  const value = useMemo(
    () => ({ userId, isLoading, displayName, signUp, signOut }),
    [userId, isLoading, displayName]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

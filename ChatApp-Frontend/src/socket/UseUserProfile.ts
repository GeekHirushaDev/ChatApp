import { useEffect, useState } from "react";
import { useWebSocket } from "./WebSocketProvider";
import { User, WSResponse } from "./chat";

export function useUserProfile() {
  const { socket, sendMessage, isConnected } = useWebSocket();
  const [userProfile, setUserProfile] = useState<User>();

  useEffect(() => {
    if (!socket || !isConnected) {
      return;
    }
    
    const onMessage = (event: MessageEvent) => {
      try {
        const response: WSResponse = JSON.parse(event.data);
        if (response.type === "user_profile") {
          console.log("User profile received:", response.payload);
          setUserProfile(response.payload);
        }
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    };
    
    socket.addEventListener("message", onMessage);
    return () => {
      socket.removeEventListener("message", onMessage);
    };
  }, [socket, isConnected]);

  return userProfile;
}

import { useEffect, useState } from "react";
import { Chat, WSResponse } from "./chat";
import { useWebSocket } from "./WebSocketProvider";

export function useChatList(): Chat[] {
  const { socket, sendMessage, isConnected } = useWebSocket();
  const [chatList, setChatList] = useState<Chat[]>([]);

  useEffect(() => {
    if (!socket || !isConnected) {
      return;
    }
    
    sendMessage({ type: "get_chat_list" });
    
    const onMessage = (event: MessageEvent) => {
      try {
        const response: WSResponse = JSON.parse(event.data);
        if (response.type === "friend_list") {
          console.log("Chat list updated:", response.payload);
          setChatList(response.payload);
        }
      } catch (error) {
        console.error("Error parsing chat list message:", error);
      }
    };
    
    socket.addEventListener("message", onMessage);
    return () => {
      socket.removeEventListener("message", onMessage);
    };
  }, [socket, isConnected, sendMessage]);

  return chatList;
}

import { io } from "socket.io-client";

export function connectToReceiveNotifications() {
    console.log("Attempting to connect to WebSocket server for notifications...");
    const client = io("ws://localhost:8080", 
    {
        path: "/getPlayerNews",
        reconnection: true,              // enable retry
        reconnectionAttempts: Infinity,  // retry forever
        reconnectionDelay: 1000,         // initial delay
        reconnectionDelayMax: 5000,      // max delay cap
        timeout: 20000                   // connection timeout
    });

    client.on("connect", () => {
    console.log("Connected to WebSocket server");
    });

    client.on("notif", (data) => {
    console.log("Notification received:", data);
    });
}

export default connectToReceiveNotifications;
import { io } from "socket.io-client";

let socket = null;

function getURL() {
  if (process.env.NODE_ENV === "production") {
    return "https://fantasydraftingtool.onrender.com";
  }
  return "http://localhost:3000";
}

function getPath() {
    return "/getPlayerNews";
}

export function isConnected(){
    return socket && socket.connected;
}

export function disconnect() {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
}

export function initSocketConnection() {
    if (!socket) {
        socket = io(getURL(), {
            path: getPath(),
            transports: ["websocket"],
            reconnection: true,
            reconnectionAttempts: Infinity,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 30000,
            randomizationFactor: 0.5,
        });
    }
    return socket;
}

export function registerNotificationHandler (handler) {
    if (socket) {
        socket.on("notif", handler);
    }
}
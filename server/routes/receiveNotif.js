const { io } = require("socket.io-client");
const { Server } = require("socket.io");

const clientMap = new Map();
const newsHistory = [];
function setupWebSocket(server) {
  const io = new Server(server, {
    path: "/getPlayerNews",
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  io.on('connection', (socket) => {
    console.log('a user connected');
    setTimeout(() => {
        console.log("Sending news history to client:", socket.id);
        socket.emit("notif", newsHistory);
        clientMap.set(socket.id, socket);
    }, 5000);

    socket.on('disconnect', () => {
      console.log('user disconnected');
      clientMap.delete(socket.id);
    });
  });

}

function connectToReceiveNotifications() {
    console.log("Attempting to connect to WebSocket server for notifications...");
    const client = io("wss://fantasybaseballgateway-nginx.onrender.com", 
    {
        path: "/ws/getPlayerNews",
        reconnection: true,              // enable retry
        reconnectionAttempts: Infinity,  // retry forever
        reconnectionDelay: 1000,         // initial delay
        reconnectionDelayMax: 5000,      // max delay cap
        timeout: 20000,                 // connection timeout

        extraHeaders: {
          "Authorization": `apikey ${process.env.API_KEY}`,
        },
    });

    client.on("connect", () => {
        console.log("Connected to WebSocket server");
    });

    client.on("notif", (data) => {
        console.log("Notification received:", data);
        clientMap.forEach((c) => {
            c.emit("notif", data);
        });
    });

    client.on("history", (data) => {
        console.log("History request received", data);
        newsHistory.push(data);
    });

    client.emit("history");
}

module.exports = {
  setupWebSocket,
  connectToReceiveNotifications
};
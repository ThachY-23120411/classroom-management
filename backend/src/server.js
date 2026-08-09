const http = require("http");
const { Server } = require("socket.io");
require("dotenv").config();

const app = require("./app");
const { registerChatSocket } = require("./modules/chat/chat.socket");

const PORT = process.env.PORT || 4000;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:5173";

const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: CLIENT_ORIGIN,
    credentials: true,
  },
});

registerChatSocket(io);

httpServer.listen(PORT, () => {
  console.log(`Backend is running on http://localhost:${PORT}`);
  console.log("Socket.io chat is ready");
});

const chatService = require("./chat.service");

function emitChatError(socket, error) {
  socket.emit("chatError", {
    success: false,
    message: error.message,
  });
}

function registerChatSocket(io) {
  io.on("connection", (socket) => {
    socket.emit("connected", {
      socketId: socket.id,
    });

    socket.on("joinRoom", async (payload) => {
      try {
        const roomData = await chatService.joinRoom(payload || {});

        socket.join(roomData.room);
        socket.emit("roomJoined", {
          success: true,
          ...roomData,
        });
      } catch (error) {
        emitChatError(socket, error);
      }
    });

    socket.on("sendMessage", async (payload) => {
      try {
        const message = await chatService.createMessage(payload || {});
        const room = chatService.buildRoomName(message.studentPhone);

        io.to(room).emit("newMessage", {
          success: true,
          data: message,
        });
      } catch (error) {
        emitChatError(socket, error);
      }
    });

    socket.on("typing", (payload = {}) => {
      try {
        const { studentPhone, senderName, senderRole } = payload;

        if (!studentPhone) {
          throw new Error("studentPhone is required");
        }

        const room = chatService.buildRoomName(studentPhone);

        socket.to(room).emit("typing", {
          studentPhone,
          senderName: senderName || senderRole || "",
          senderRole: senderRole || "",
        });
      } catch (error) {
        emitChatError(socket, error);
      }
    });

    socket.on("leaveRoom", (payload = {}) => {
      try {
        const { studentPhone } = payload;

        if (!studentPhone) {
          throw new Error("studentPhone is required");
        }

        const room = chatService.buildRoomName(studentPhone);
        socket.leave(room);
        socket.emit("roomLeft", {
          success: true,
          room,
          studentPhone,
        });
      } catch (error) {
        emitChatError(socket, error);
      }
    });
  });
}

module.exports = {
  registerChatSocket,
};

import { Server } from "socket.io";

const socketServer = (req, res) => {
  if (res.socket.server.io) {
    console.log("Socket server is already running");
    res.end();
    return;
  }

  const io = new Server(res.socket.server);
  res.socket.server.io = io;

  const userIo = io.of("/user");

  const chatRoomIo = io.of("/chatroom");

  const discussionIo = io.of("/discussion");

  const socketHandler = (socket) => {
    socket.emit("connection", "You are connected successfully");
    console.log(`USER ${socket.id} CONNECTED SUCCESSFULLY`);

    socket.on("chat", (chat) => {
      chatRoomIo
        .to(chat?.ChatroomID)
        .emit("chat_sent", (message = "chat recieved"));
    });

    socket.on("join", (roomID) => {
      socket.join(roomID);
      console.log(`USER WITH ${socket?.id} JOINED CHATROOM ${roomID}`);
    });

    socket.on("new-discussion", () => {
      discussionIo.emit("new-discussion");
    });

    socket.on("disconnection", () => {
      console.log(`USER ${socket.id} DISCONNECTED SUCCESSFULLY`);
    });
  };

  const userHandler = (socket) => {
    socket.emit(
      "connection",
      (message = "You are connected to user namespace successfully")
    );
    console.log(`USER ${socket.id} CONNECTED TO USER NAMESPACE SUCCESSFULLY`);

    socket.on("disconnection", () => {
      console.log(
        `USER ${socket.id} DISCONNECTED FROM USER NAMESPACE SUCCESSFULLY`
      );
    });
  };

  const chatroomHandler = (socket) => {
    socket.emit(
      "connection",
      (message = "You are connected to chatroom namespace successfully")
    );
    console.log(
      `USER ${socket.id} CONNECTED TO CHATROOM NAMESPACE SUCCESSFULLY`
    );

    socket.on("disconnection", () => {
      console.log(
        `USER ${socket.id} DISCONNECTED FROM CHATROOM NAMESPACE SUCCESSFULLY`
      );
    });

    socket.on("chat", (chat) => {
      chatRoomIo
        .to(chat?.ChatroomID)
        .emit("chat_sent", (message = "chat recieved"));
    });

    socket.on("join", (roomID) => {
      socket.join(roomID);
      console.log(`USER WITH ${socket?.id} JOINED CHATROOM ${roomID}`);
    });
  };

  const discussionHandler = (socket) => {
    socket.emit(
      "connection",
      (message = "You are connected to discussion namespace successfully")
    );
    console.log(
      `USER ${socket.id} CONNECTED TO DISCUSSION NAMESPACE SUCCESSFULLY`
    );

    socket.on("disconnection", () => {
      console.log(
        `USER ${socket.id} DISCONNECTED FROM DISCUSSION NAMESPACE SUCCESSFULLY`
      );
    });

    socket.on("new-discussion", () => {
      discussionIo.emit("new-discussion");
    });
  };

  discussionIo.on("connection", discussionHandler);

  userIo.on("connection", userHandler);

  chatRoomIo.on("connection", chatroomHandler);

  io.on("connection", socketHandler);

  console.log("Setting up socket");

  res.end();
};

export default socketServer;

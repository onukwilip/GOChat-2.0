import axios from "axios";

// C:\NodeJSPractice\go-chat-node-server

export const socketDomain = `https://gochat-socket.onrender.com`;
// export const socketDomain = `http://localhost:3002`;
// export const socketDomain = `./api/socket`;

export const getOne = async (url, header) => {
  const response = await axios.get(url, header).catch();
  let firstItem;
  if (response) {
    const data = response.data?.Data;
    if (Array.isArray(data)) {
      firstItem = data[0];
    }
  }
  return firstItem;
};

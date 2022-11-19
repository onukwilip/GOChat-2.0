import React, { useContext, useEffect, useState } from "react";
import css from "./ChatBlock.module.css";
import dummy from "../../../assets/images/dummy-img.png";
import { Form, FormGroup } from "../../Form/Form";
import { Button } from "../../Button/Button";
import MyChats from "../Chats/MyChats/MyChats";
import TheirChats from "../Chats/TheirChats/TheirChats";
import { General } from "../../../context/GeneralContext";
import { Chats } from "../../../dummyData";
import axios from "axios";
import Loader from "../../Loader/Loader";
import ServerError from "../../ServerError/ServerError";
import io from "socket.io-client";
import { v4 as uuidv4 } from "uuid";
import { useRef } from "react";
import ScrollToBottom from "react-scroll-to-bottom";
import { sendDiscussion } from "../Messages/Messages";
import { getOne } from "../../ExternalFunctions";
import { socketDomain } from "../../ExternalFunctions";

const socket = io.connect(`${socketDomain}/chatroom`);

export const emitMessage = (chat) => {
  socket.emit("chat", { ...chat });
  socket.emit(
    "join",
    JSON.parse(sessionStorage.getItem("chatRoom"))?.ChatRoomID
  );
};

const ChatBlock = (props) => {
  const general = useContext(General);
  const userID = props.userId;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [intervalId, setIntervalId] = useState("");
  const [newChats, setNewChats] = useState([]);
  const [refreshChat, setRefreshChat] = useState(false);
  const url = `${general.domain}api`;

  const [chatRoomProfile, setChatRoomProfile] = useState({
    ...JSON.parse(
      typeof window !== "undefined" ? sessionStorage.getItem("chatRoom") : "{}"
    ),
  });
  const [chats, setChats] = useState([]);

  const getChatRoom = async () => {
    setLoading(true);
    setError(false);

    const { ChatRoomID } = {
      ...JSON.parse(sessionStorage.getItem("chatRoom")),
    };
    const base64ChatRoomID = general.toBase64(ChatRoomID);

    const _url = `${url}/chatroom/${base64ChatRoomID}/chatroom`;

    const response = await axios.get(_url, { ...general.config }).catch((e) => {
      console.log(e);
      if (e.request) {
        setLoading(false);
        setError(true);
      } else {
        setLoading(false);
        setError(false);
      }
    });

    if (response) {
      const chatRoomData = response?.data?.Data;
      const chatRoomArray = chatRoomData?.map((chatroom) => {
        setChatRoomProfile(chatroom);
        setChats(chatroom.Chats);
        // console.log("Loaded!");
        // console.log("Chatroom!", chatroom);
      });
      setLoading(false);
      setError(false);
    }
  };

  const NoChatsAvailable = () => {
    return (
      <div className={css["no-chat"]}>
        <h1>No chats available...</h1>
        <p>
          Some people are actually shy to start the chat, why don't you trigger
          the discussion 😁
        </p>
      </div>
    );
  };

  const addFileHandelr = (e) => {
    if (e?.target?.files[0]?.name?.length > 0) {
      general.setChatFiles((prev) => [...prev, e?.target?.files[0]]);
    }
    console.log("File", e?.target?.files[0]);
  };

  const removeFileHandler = (name) => {
    general.setChatFiles((prevFiles) =>
      prevFiles.filter((file) => file?.name !== name)
    );
  };

  const refreshMessage = () => {
    general.setChatMessage("");
    general.setChatFiles([]);
    general.setParentChatProperties({
      parentID: "",
      parentName: "",
      parentMessage: "",
      chatRoomID: "",
    });
  };

  const submitChatFiles = async (ip, chatID) => {
    const _url = `${url}/chats/${general.toBase64(
      chatRoomProfile?.ChatRoomID
    )}/${chatID}`;
    const config = {
      headers: {
        ...general.config?.headers,
        "Content-type": "multipart/form-data",
        "Access-control-allow-origin": "*",
      },
    };

    general.chatFiles.forEach((file) => {
      // console.log("ChatFile", file);
    });

    const formData = new FormData();
    general.chatFiles.forEach((file) => {
      formData.append(`body${general.chatFiles.length}`, file);
    });

    const response = await axios
      .post(_url, formData, { ...config })
      .catch((e) => {
        console.log(e);
        if (e.request) {
          setLoading(false);
          setError(true);
        } else {
          setLoading(false);
          setError(false);
        }
      });

    if (response) {
      // console.log("File", response);

      setLoading(false);
      setError(false);

      return response;
    }
  };

  const submitChatMessage = async (ip, chat) => {
    const _url = `${url}/chats/`;
    const config = {
      ...general.config,
    };

    const response = await axios
      .post(_url, { ...chat }, { ...config })
      .catch((e) => {
        console.log(e);
        if (e.request) {
          setLoading(false);
          setError(true);
        } else {
          setLoading(false);
          setError(false);
        }
      });

    if (response) {
      // console.log("Message", response);

      setLoading(false);
      setError(false);

      return response;
    }
  };

  const onSubmitHandler = async () => {
    general.setSubmitChatProperties((prev) => ({
      ...prev,
      disabled: true,
      chatRoomID: chatRoomProfile?.ChatRoomID,
    }));

    const chatID = `CHAT_${uuidv4()}`;

    const chat = {
      message: general.chatMessage,
      type: "chat",
      Parent: {
        ParentID: general.parentChatProperties?.parentID,
      },
      Author: {
        AuthorID: userID,
        AuthorName: "Prince",
      },
      ChatroomID: chatRoomProfile?.ChatRoomID,
      ChatID: chatID,
    };

    if (general.chatMessage !== null || general.chatMessage !== "") {
      const message = await submitChatMessage(general.ipAddress, chat);
      const file = await submitChatFiles(general.ipAddress, chatID);

      if (message) {
        if (chat?.Parent?.ParentID !== null && chat?.Parent?.ParentID !== "") {
          const _url = `${general.domain}api/chats/${chat?.Parent?.ParentID}/chat`;
          const parentChatResponse = await axios
            .get(_url, general.config)
            .catch((e) => {
              console.log(e);
              general.sendDiscussion({
                ChatID: chatID,
                ChatRoomID: chatRoomProfile?.ChatRoomID,
                LastMessage: `Replied a chat`,
                MemberID: userID,
              });
            });
          if (parentChatResponse) {
            let parentChat;

            parentChatResponse?.data?.Data.map((eachChat) => {
              parentChat = eachChat;
            });

            const parentChatAuthor = parentChat?.Author?.AuthorName;

            general.sendDiscussion({
              ChatID: chatID,
              ChatRoomID: chatRoomProfile?.ChatRoomID,
              LastMessage: `Replied ${parentChatAuthor}`,
              MemberID: userID,
            });
          }
        } else {
          general.sendDiscussion({
            ChatID: chatID,
            ChatRoomID: chatRoomProfile?.ChatRoomID,
            LastMessage: `${general.chatMessage}`,
            MemberID: userID,
          });
        }

        let parentChatAttributes = {};

        if (chat?.Parent?.ParentID !== null && chat?.Parent?.ParentID !== "") {
          parentChatAttributes = await getOne(
            `${general.domain}api/chats/${chat.Parent.ParentID}/chat`,
            general.config
          );
        }

        const authorChatAttributes = await getOne(
          `${general.domain}api/user/${chat.Author.AuthorID}`,
          general.config
        );

        const newChat = {
          ChatID: chat.ChatID,
          Message: chat.message,
          Date: new Date(),
          Type: "chat",
          Parent: {
            ParentID: chat.Parent.ParentID,
            ParentAuthor: parentChatAttributes?.Author?.AuthorName
              ? parentChatAttributes?.Author?.AuthorName
              : null,
            ParentMessage: parentChatAttributes?.Message
              ? parentChatAttributes?.Message
              : null,
          },
          Author: {
            AuthorID: chat.Author.AuthorID,
            AuthorName: authorChatAttributes?.UserName,
            AuthorImage: authorChatAttributes?.ProfilePicture,
          },
          ChatFile: general.chatFiles.map((eachFile) => {
            return {
              FileName: eachFile?.name,
              Path: URL.createObjectURL(eachFile),
              Size: eachFile?.size,
            };
          }),
          ChatroomID: chat.ChatroomID,
          Reactions: [],
        };

        addChatHandler(newChat);

        // console.log("NEW CHAT", newChat);
        // console.log("PARENT CHAT", parentChatAttributes);
        // console.log("AUTHOR CHAT", authorChatAttributes);

        emitMessage(chat);
        sendDiscussion();

        general.setChatMessage("");
        general.setParentChatProperties({
          parentID: "",
          parentName: "",
          parentMessage: "",
          chatRoomID: "",
        });
        general.setSubmitChatProperties((prev) => ({
          ...prev,
          disabled: false,
          messageError: false,
        }));
      } else {
        general.setSubmitChatProperties((prev) => ({
          ...prev,
          disabled: false,
          messageError: true,
        }));
      }

      if (file) {
        general.setChatFiles([]);
        general.setChatMessage("");
        general.setParentChatProperties({
          parentID: "",
          parentName: "",
          parentMessage: "",
          chatRoomID: "",
        });
        general.setSubmitChatProperties((prev) => ({
          ...prev,
          disabled: false,
          fileError: false,
        }));
      } else {
        general.setSubmitChatProperties((prev) => ({
          ...prev,
          disabled: false,
          fileError: true,
        }));
      }

      if (message && file) {
        console.log("Both submitted successfully");

        general.setChatMessage("");
        general.setChatFiles([]);
        general.setParentChatProperties({
          parentID: "",
          parentName: "",
          parentMessage: "",
          chatRoomID: "",
        });
        general.setSubmitChatProperties((prev) => ({
          ...prev,
          disabled: false,
          error: false,
          messageError: false,
          fileError: false,
          chatRoomID: "",
        }));
      }

      if (!(message && file)) {
        general.setSubmitChatProperties((prev) => ({
          ...prev,
          disabled: false,
          error: true,
        }));
      }

      // general.setRefreshState((prev) => !prev);
    }
  };

  const intervalHandler = () => {
    const interval = setInterval(() => {
      const _url = `${url}/chats/${general.toBase64(
        JSON.parse(sessionStorage.getItem("chatRoom"))?.ChatRoomID
      )}`;
      axios
        .get(_url)
        .then((response) => {
          if (response?.data?.length > 0) {
            setNewChats(response?.data);
          }
        })
        .catch((e) => {});
    }, 10000);
    setIntervalId(interval);
  };

  const removeParentChat = () => {
    general.setParentChatProperties({
      parentID: "",
      parentName: "",
      parentMessage: "",
      chatRoomID: "",
    });
  };

  const removeChat = (chatID) => {
    setChats((prev) => prev.filter((eachChat) => eachChat?.ChatID !== chatID));
  };

  const addChatHandler = (newChat) => {
    const oldChats = [...chats];
    if (Array.isArray(oldChats)) {
      setChats([...oldChats, { ...newChat }]);
    }
  };

  useEffect(() => {
    getChatRoom();
    setChatRoomProfile({ ...JSON.parse(sessionStorage.getItem("chatRoom")) });
    refreshMessage();
    socket.emit(
      "join",
      JSON.parse(sessionStorage.getItem("chatRoom"))?.ChatRoomID
    );
  }, [general.refreshState]);

  useEffect(() => {
    socket.emit(
      "join",
      JSON.parse(sessionStorage.getItem("chatRoom"))?.ChatRoomID
    );

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    const _url = `${url}/chats/${general.toBase64(
      JSON.parse(sessionStorage.getItem("chatRoom"))?.ChatRoomID
    )}`;
    axios
      .get(_url, { ...general.config })
      .then((response) => {
        if (response?.data?.length > 0) {
          setChats(response?.data);
        }
      })
      .catch((e) => {});
  }, [refreshChat]);

  useEffect(() => {
    socket.on("connection", (message) => {
      console.log(message);
    });

    socket.on("chat_sent", (message) => {
      setRefreshChat((prev) => !prev);
      console.log("chat_emit recieved and state refreshed");
    });
  }, [socket]);

  useEffect(() => {
    const chatIndex = chats.findIndex(
      (chat) => chat.ChatID === general.updatedChat.details.ChatID
    );
    if (chats?.length > 0 && Array.isArray(chats)) {
      let prevChats = [...chats];
      let updatedChat = prevChats[chatIndex];

      if (
        typeof updatedChat === "object" &&
        updatedChat !== null &&
        updatedChat !== undefined
      ) {
        updatedChat.Message = general.updatedChat.details.Message;
      }

      prevChats[chatIndex] = updatedChat;

      if (prevChats?.length > 0) {
        setChats(prevChats);
      }

      console.log("Chat index", chatIndex);
      console.log("Updated chat", updatedChat);
    }
  }, [general.updatedChat.state]);

  const date = new Date(chatRoomProfile.LastSeen);

  return (
    <section className={css.chat}>
      <div className={css.bg}></div>
      <div className={css.body}>
        <div className={css.header}>
          <div>
            <div className={css["img-container"]}>
              <img
                src={
                  Object.keys(chatRoomProfile).length > 0 &&
                  chatRoomProfile?.ProfilePicture
                    ? chatRoomProfile?.ProfilePicture
                    : Object.keys(chatRoomProfile).length < 1 &&
                      props.image != null
                    ? props.image
                    : dummy?.src
                }
                alt=""
              />
              <div
                className={`${css.status} ${
                  Object.keys(chatRoomProfile).length > 0 &&
                  chatRoomProfile.IsOnline
                    ? css.online
                    : Object.keys(chatRoomProfile).length > 0 &&
                      !chatRoomProfile.IsOnline
                    ? css.offline
                    : css.IsOnline
                }`}
              ></div>
            </div>
            <div className={css["details"]}>
              <p className={css["name"]}>
                {chatRoomProfile.ChatRoomName
                  ? chatRoomProfile.ChatRoomName
                  : props.userName}
              </p>
              <p className={css.status}>
                {Object.keys(chatRoomProfile).length > 0 &&
                chatRoomProfile?.IsOnline
                  ? "Online"
                  : Object.keys(chatRoomProfile).length > 0 &&
                    !chatRoomProfile?.IsOnline
                  ? `Last seen ${date.getFullYear()}/${
                      date.getMonth() + 1
                    }/${date.getDate()}`
                  : "Online"}
              </p>
            </div>
          </div>
        </div>
        <ScrollToBottom className={css["platform"]}>
          {/* CHAT PLATFORM GOES IN HERE... */}
          {loading ? (
            <Loader />
          ) : error ? (
            <div className={css["no-chat"]}>
              <ServerError />
            </div>
          ) : (
            <>
              {chats.length < 1 && <NoChatsAvailable />}
              {chats.map((eachChat, i) => {
                return (
                  <div>
                    {eachChat?.Author?.AuthorID === userID ? (
                      <MyChats
                        _chat={eachChat}
                        removeChat={removeChat}
                        key={i}
                      />
                    ) : (
                      <TheirChats _chat={eachChat} key={i} />
                    )}
                  </div>
                );
              })}
            </>
          )}
        </ScrollToBottom>
        {general.parentChatProperties.chatRoomID ===
          chatRoomProfile?.ChatRoomID &&
        general.parentChatProperties.parentID !== null &&
        general.parentChatProperties.parentID !== "" ? (
          <div className={css["parent-chat"]}>
            <div className={css["replied-message"]}>
              <div>
                <em className={css["parent-author"]}>
                  {general.parentChatProperties?.parentName}
                </em>
                <em className={css["parent-message"]}>
                  {general.parentChatProperties?.parentMessage}
                </em>
              </div>
              <div onClick={removeParentChat} className={css["remove-parent"]}>
                X
              </div>
            </div>
          </div>
        ) : null}
        <div className={css.form}>
          {general.chatFiles.length > 0 ? (
            <div className={css["files-container"]}>
              {general.chatFiles.map((file, i) => (
                <div
                  onClick={() => {
                    removeFileHandler(file?.name);
                  }}
                  key={i}
                >
                  {file?.name}
                </div>
              ))}
            </div>
          ) : null}
          <Form>
            <div className={css["form-parent"]}>
              <div className={css["l-side"]}>
                <FormGroup
                  icon={`fa-solid fa-face-smile ${css.cursor} ${css["icon-hover"]}`}
                  placeholder="Enter message..."
                  value={general.chatMessage}
                  onChange={(e) => {
                    general.setChatMessage(e?.target?.value);
                  }}
                />
              </div>
              <label htmlFor="file_upload">
                <input
                  type="file"
                  name="file_upload"
                  onChange={addFileHandelr}
                  id="file_upload"
                  hidden
                />
                <div className={css.middle}>
                  <i className="fa-solid fa-paperclip"></i>
                </div>
              </label>
              {general.chatMessage !== null && general.chatMessage !== "" ? (
                <>
                  {general.submitChatProperties.disabled ? (
                    "Loading..."
                  ) : (
                    <div className={css["r-side"]}>
                      <button
                        onClick={onSubmitHandler}
                        disabled={general.submitChatProperties.disabled}
                      >
                        <i className="fa-solid fa-paper-plane"></i>
                      </button>
                    </div>
                  )}
                </>
              ) : null}
            </div>
          </Form>
          {general.submitChatProperties.chatRoomID ===
            chatRoomProfile.ChatRoomID && (
            <div style={{ width: "100%" }} align="center">
              {general.submitChatProperties.messageError && (
                <p className="error">There was an error in sending your chat</p>
              )}
              {general.submitChatProperties.fileError && (
                <p className="error">
                  There was an error in sending the files of your chat
                </p>
              )}
              {general.submitChatProperties.error && (
                <p className="error">Could not send chat</p>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default ChatBlock;

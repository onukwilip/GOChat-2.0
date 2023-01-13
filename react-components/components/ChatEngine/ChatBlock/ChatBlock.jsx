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
import { Table } from "../../../../ExternalFunctions";
import Glassmorphism from "../../Glassmorphism/Glassmorphism";
import { formatRelative } from "date-fns";
import { BouncyBallsLoader } from "react-loaders-kit";

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
  const url = `${general.domain}api`;
  const dates = new Set();
  const [chatRoomProfile, setChatRoomProfile] = useState({});
  const [chats, setChats] = useState(new Table());
  let fetchingChats = false;
  const [gettingChats, setGettingChats] = useState(false);

  const getChats = async (date /**@type Date */, type /**@type String */) => {
    if (!fetchingChats) {
      fetchingChats = true;
      const _url = `${url}/chats/${general.toBase64(
        JSON.parse(sessionStorage.getItem("chatRoom"))?.ChatRoomID
      )}/${general.toBase64(date?.toLocaleDateString())}`;
      const response = await axios
        .get(_url, { ...general.config })
        .catch((e) => {
          console.log("Refresh error", e);
          fetchingChats = false;
          setGettingChats(false);
        });

      if (response) {
        setGettingChats(false);

        if (response?.data) {
          setTimeout(() => {
            fetchingChats = false;
          }, 15000);
          const _chats = new Table(chats.instance);
          type === "append"
            ? _chats.append(response?.data)
            : _chats.prepend(response?.data);
          setChats(_chats);

          console.log("Refresh data", response);
        }
      }
    }
  };

  const getPrevChats = async (/**@type Date */ date) => {
    const _url = `${url}/chats/${general.toBase64(
      JSON.parse(sessionStorage.getItem("chatRoom"))?.ChatRoomID
    )}/${general.toBase64(date?.toLocaleDateString())}`;

    const response = await axios.get(_url, { ...general.config }).catch((e) => {
      setGettingChats(false);
    });

    if (response) {
      setGettingChats(false);

      if (response?.data) {
        const _chats = new Table(chats.instance);
        _chats.prepend(response?.data);
        setChats(_chats);

        console.log("Refresh data", response);
      }
    }
  };

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

        setChats(
          new Table(
            typeof chatroom?.Chats === "object" &&
            Object.keys(chatroom?.Chats).length > 0
              ? chatroom?.Chats
              : null
          )
        );

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

  const removeParentChat = () => {
    general.setParentChatProperties({
      parentID: "",
      parentName: "",
      parentMessage: "",
      chatRoomID: "",
    });
  };

  const removeChat = (chatID) => {
    const oldChats = new Table(chats.instance);
    oldChats.delete(chatID);
    setChats(oldChats);
  };

  const addChatHandler = (newChat) => {
    const { ChatID: chatId } = newChat;
    const chatToBeAdded = {
      [chatId]: newChat,
    };
    const oldChats = new Table(chats.instance);
    oldChats.append(chatToBeAdded);
    setChats(new Table(oldChats.instance));
  };

  const formatDate = (/**@type String*/ date) => {
    try {
      return formatRelative(new Date(date), new Date())?.toLocaleUpperCase();
    } catch (e) {
      return date.toLocaleUpperCase();
    }
  };

  const SetDate = (/**@type String*/ date) => {
    dates.add(date);

    return (
      <div className={css.date}>
        <Glassmorphism>
          <em>{formatDate(date)}</em>
        </Glassmorphism>
      </div>
    );
  };

  const getPrevious = () => {
    console.log("Click");
    try {
      setGettingChats(true);
      const stringDateArray = [...dates];

      if (stringDateArray.length < 1) {
        return;
      }

      const dateArray = stringDateArray.map((eachDate) => new Date(eachDate));
      const minDate = new Date(Math.min(...dateArray));
      minDate.setDate(minDate.getDate() - 1);
      getPrevChats(minDate);
    } catch (e) {
      getPrevChats(new Date());
      console.log(e);
    }
  };

  const BouncyLoader = () => {
    const loader = {
      loading: true,
      size: 35,
      duration: 0.4,
      colors: ["lightblue", "purple", "lightblue"],
    };

    return <BouncyBallsLoader {...loader}></BouncyBallsLoader>;
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
    setChatRoomProfile({
      ...JSON.parse(sessionStorage.getItem("chatRoom")),
    });
    return () => {
      clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    socket.on("connection", (message) => {
      console.log(message);
    });

    socket.on("chat_sent", (message) => {
      // setRefreshChat((prev) => !prev);
      getChats(new Date(), "append");
      console.log("chat_emit recieved and state refreshed");
    });
  }, [socket]);

  useEffect(() => {
    const oldChats = new Table(chats.instance);
    const oldChat = oldChats.get(general.updatedChat.details.ChatID);
    oldChats.update(general.updatedChat.details.ChatID, {
      ...oldChat,
      Message: general.updatedChat.details.Message,
    });
    //console.table("Old chats", oldChats);
    setChats(oldChats);
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
              {chats?.isEmpty() ? (
                <NoChatsAvailable />
              ) : (
                <>
                  <div className={css.previous}>
                    {!gettingChats ? (
                      <button
                        onClick={() => {
                          getPrevious();
                        }}
                        disabled={gettingChats}
                      >
                        <em>{gettingChats ? "Loading" : "Get previous"}</em>
                      </button>
                    ) : (
                      BouncyLoader()
                    )}
                  </div>
                  {chats?.map((eachChat, key) => {
                    // console.log("Each chat", eachChat);
                    // console.log("chat array", chats.toArray());
                    // console.log("chat", chats);
                    const date = new Date(eachChat?.Date).toLocaleDateString();

                    return (
                      <div>
                        {!dates.has(date) && SetDate(date)}
                        {eachChat?.Author?.AuthorID === userID ? (
                          <MyChats
                            _chat={eachChat}
                            removeChat={removeChat}
                            key={key}
                            userId={props.userId}
                          />
                        ) : (
                          <TheirChats
                            _chat={eachChat}
                            userId={props.userId}
                            key={key}
                          />
                        )}
                      </div>
                    );
                  })}
                </>
              )}
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

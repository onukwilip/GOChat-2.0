import axios from "axios";
import React, { createContext, useEffect, useState } from "react";
import { groupNotify } from "../components/ChatEngine/Groups/Groups";
import { notify } from "../components/ChatEngine/Notifications/Notifications";

//C:\NodeJsPractice\go-chat-node-server

export const General = createContext({
  domain: ``,
  config: "",
  setConfig: (value) => {},
  emailToSendOTP: "",
  setEmailToSendOTP: (email) => {},
  OTPconfirmType: "",
  setOTPConfirmType: (type) => {},
  refreshState: "",
  setRefreshState: () => {},
  toBase64: (string) => {},
  fromBase64: (string) => {},
  modalState: "",
  setModalState: (state) => {},
  chatMessage: "",
  setChatMessage: (string) => {},
  chatFiles: [],
  setChatFiles: (file) => {},
  submitChatProperties: {
    disabled: false,
    messageError: false,
    fileError: false,
    chatRoomID: "",
    error: false,
  },
  setSubmitChatProperties: (properites) => {},
  parentChatProperties: {
    parentID: "",
    parentName: "",
    parentMessage: "",
    chatRoomID: "",
  },
  setParentChatProperties: (properites) => {},
  socketDomain: "",
  ipAddress: "",
  setIpAddress: (ip) => {},
  sendDiscussion: (properties) => {},
  updatedChat: {
    state: true,
    details: {
      ChatID: "",
      Message: "",
    },
  },
  setUpdateChat: (details) => {},
  postNotification: (body) => {},
  refreshAll: (url, header, [...setStates]) => {},
});

const GeneralContext = (props) => {
  const [emailToSendOTP, setEmailToSendOTP] = useState("");
  const [OTPConfirmType, setOTPConfirmType] = useState("");
  const [refreshState, setRefreshState] = useState(false);
  const [chatMessage, setChatMessage] = useState("");
  const [chatFiles, setChatFiles] = useState([]);
  const [ipAddress, setIpAddress] = useState("");
  const [modalState, setModalState] = useState();
  const [submitChatProperties, setSubmitChatProperties] = useState({
    disabled: false,
    messageError: false,
    fileError: false,
    error: false,
    chatRoomID: "",
  });
  const [parentChatProperties, setParentChatProperties] = useState({
    parentID: "",
    parentName: "",
    parentMessage: "",
    chatRoomID: "",
  });
  const [updatedChat, setUpdateChat] = useState({
    state: true,
    details: {
      ChatID: "",
      Message: "",
    },
  });
  const socketDomain = `https://localhost/3002`;
  //IIS EXPRESS
  const domain = process.env.API_DOMAIN;
  //IIS MANAGER
  // const domain = `http://localhost:8082/`;
  //MYASP.NET SERVER
  // const domain = "http://prince2006-001-site1.itempurl.com/";
  //AZURE WEB APP
  // const domain = "https://gochatapi.azurewebsites.net/";

  const toBase64 = (string) => {
    if (typeof window !== "undefined") {
      return window.btoa(string);
    } else {
      return string;
    }
  };

  const [token, setToken] = useState("");

  const [config, setConfig] = useState({
    headers: {
      "Access-control-allow-origin": "*",
      // "Content-type": "application/json;charset=UTF-8",
    },
  });

  const fromBase64 = (string) => {
    if (typeof window !== "undefined") {
      return window.atob(string);
    } else {
      return string;
    }
  };

  const sendDiscussion = async (body) => {
    let userName;
    //GET USER NAME
    const _url = `${domain}api/user/${body?.MemberID}`;
    const userResponse = await axios.get(_url, config).catch((e) => {
      console.log(e);
    });

    if (userResponse) {
      const user = userResponse?.data?.Data?.map((eachUser) => {
        userName = eachUser?.UserName;
      });
    }

    //SUBMIT DISCUSSION
    const url = `${domain}api/discussion`;
    const _body = {
      ...body,
      LastMessage: `${userName}: ${body?.LastMessage}`,
    };
    const response = await axios.post(url, _body, config).catch((e) => {
      console.log(e);
    });
    if (response) {
      console.log("Discussion sent successfully");
    }
  };

  const postNotification = async (body) => {
    const url = `${domain}api/notification`;

    const _config = { ...config };

    const response = await axios.post(url, body, _config).catch((e) => {
      console.log(e);
    });

    console.log(response?.data);
    if (Array.isArray(body)) {
      body.forEach((user) => {
        notify(user?.UserID);
        groupNotify(user?.UserID);
        console.log("Notification socket pinged successfully");
      });
    }
    console.log("Notification sent successfully");
  };

  const refreshAll = async (url, header, setStates) => {
    const response = await axios.get(url, header).catch((e) => {
      console.log(e);
    });

    if (response) {
      const data = response?.data?.Data;

      if (data?.length > 0) {
        for (const setState of setStates) {
          setState(data);
        }
      }
    }
  };

  useEffect(() => {
    setModalState(sessionStorage.getItem("modalState"));
    // setToken(localStorage.getItem("token"));
  }, []);

  const context = {
    domain: domain,
    config: config,
    setConfig: setConfig,
    emailToSendOTP: emailToSendOTP,
    setEmailToSendOTP: setEmailToSendOTP,
    OTPconfirmType: OTPConfirmType,
    setOTPConfirmType: setOTPConfirmType,
    refreshState: refreshState,
    setRefreshState: setRefreshState,
    toBase64: toBase64,
    fromBase64: fromBase64,
    modalState: modalState,
    setModalState: setModalState,
    chatMessage: chatMessage,
    setChatMessage: setChatMessage,
    chatFiles: chatFiles,
    setChatFiles: setChatFiles,
    submitChatProperties: submitChatProperties,
    setSubmitChatProperties: setSubmitChatProperties,
    parentChatProperties: parentChatProperties,
    setParentChatProperties: setParentChatProperties,
    socketDomain: socketDomain,
    ipAddress: ipAddress,
    setIpAddress: setIpAddress,
    sendDiscussion: sendDiscussion,
    updatedChat: updatedChat,
    setUpdateChat: setUpdateChat,
    postNotification: postNotification,
    refreshAll: refreshAll,
  };

  return <General.Provider value={context}>{props.children}</General.Provider>;
};

export default GeneralContext;

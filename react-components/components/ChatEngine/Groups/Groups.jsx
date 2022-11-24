import React, { useContext, useEffect, useState } from "react";
import css from "./Groups.module.css";
import dummy from "../../../assets/images/dummy-img.png";
import axios from "axios";
import { General } from "../../../context/GeneralContext";
import { useRouter, useParams } from "next/router";
import { Form, FormGroup } from "../../Form/Form";
import { Button } from "../../Button/Button";
import Loader from "../../Loader/Loader";
import ServerError from "../../ServerError/ServerError";
import {
  ChatRoomProfile,
  Notification,
  RecievedRequest,
  SentRequest,
  UserProfile,
} from "../Sidebar/Sidebar";
import NoItem from "../../NoItem/NoItem";
import { io } from "socket.io-client";
import { socketDomain } from "../../ExternalFunctions";
// import { notificationSocket } from "../Notifications/Notifications";

const groupNotificationSocket = io.connect(`${socketDomain}/notification`);
export const groupNotify = (userid) => {
  groupNotificationSocket.emit("notify", userid);
};

const Profile = ({ chatroom, refreshState, userId }) => {
  const router = useRouter();
  const [requestStatus, setRequestStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const general = useContext(General);
  const groupid = router.query?.groupid;
  const _recipientId = groupid;
  const apiPrefix = general.domain;
  const config = general.config;
  const url = apiPrefix + `api`;
  const senderId = userId;
  const [disabled, setDisabled] = useState({
    cancelDisabled: false,
    requestDisabled: false,
  });

  const getRequestStatus = async () => {
    setLoading(true);

    const _url = `${url}/requests/verify/${_recipientId}/group`;
    const response = await axios.get(_url, general.config).catch((e) => {
      console.log(e);
      setLoading(false);
    });

    if (response) {
      setLoading(false);
    }

    const responseData = Number(response?.data?.ResponseCode);
    setRequestStatus(responseData);
    console.log("Response code", responseData);
  };

  const sendRequest_User_Group = async () => {
    setDisabled((prev) => ({
      ...prev,
      requestDisabled: true,
    }));

    const userResponse = await axios
      .get(`${url}/user/${senderId}`, { ...general.config })
      .catch((e) => {
        console.log(e);
      });

    let user_;

    userResponse?.data?.Data?.map((eachUser) => {
      user_ = eachUser;
    });

    const body = {
      From: { UserID: senderId },
      To: { UserID: _recipientId },
      Message: `Hello...My name is ${user_?.UserName}, and i would like to join your group?`,
      From_Type: "User",
      To_Type: "Group",
    };

    const _url = `${url}/request`;

    const response = await axios
      .post(_url, body, { ...general.config })
      .catch((e) => {
        setDisabled((prev) => ({
          ...prev,
          requestDisabled: false,
        }));
        console.log(e);
      });

    if (response?.data?.ResponseCode === 200) {
      let senderName;
      const sender = await axios
        .get(`${general.domain}api/user/${senderId}`, { ...general.config })
        .catch();

      for (var _user of sender?.data?.Data) {
        senderName = _user?.UserName;
      }

      const body = [
        {
          ID: 0,
          UserID: senderId,
          IdentityToRender: {
            IdentityToRenderID: _recipientId,
            IdentityToRenderName: null,
            IdentityToRenderProfilePicture: null,
            IsOnline: false,
          },
          Message: `You sent a request to ${chatroom?.ChatRoomName}`,
          Type: "Group",
          Target: "requests",
          Viewed: false,
        },
        {
          ID: 0,
          UserID: _recipientId,
          IdentityToRender: {
            IdentityToRenderID: senderId,
            IdentityToRenderName: null,
            IdentityToRenderProfilePicture: null,
            IsOnline: false,
          },
          Message: `You recieved a request from ${senderName}`,
          Type: "User",
          Target: "requests",
          Viewed: false,
        },
      ];
      general.postNotification(body);

      setDisabled((prev) => ({
        ...prev,
        requestDisabled: false,
      }));
    }

    // console.log(response);
    refreshState((prev) => !prev);
  };

  const cancelRequest = async () => {
    setDisabled((prev) => ({
      ...prev,
      cancelDisabled: true,
    }));

    const _url = `${url}/requests/delete/${senderId}/${_recipientId}`;

    const response = await axios.delete(_url, general.config).catch((e) => {
      setDisabled((prev) => ({
        ...prev,
        cancelDisabled: false,
      }));
      console.log(e);
    });

    if (response) {
      const body = [
        {
          ID: 0,
          UserID: senderId,
          IdentityToRender: {
            IdentityToRenderID: _recipientId,
            IdentityToRenderName: null,
            IdentityToRenderProfilePicture: null,
            IsOnline: false,
          },
          Message: `You cancelled your request to ${chatroom?.ChatroomName}`,
          Type: "User",
          Target: "users",
          Viewed: false,
        },
      ];
      general.postNotification(body);

      setDisabled((prev) => ({
        ...prev,
        cancelDisabled: false,
      }));
    }

    console.log(response);
    refreshState((prev) => !prev);
  };

  const leaveGroup = async () => {
    const response = await axios.delete(
      `${url}/chatroom/${chatroom?.ChatRoomID}`,
      general.config
    );
    if (response) {
      const body = [
        {
          ID: 0,
          UserID: senderId,
          IdentityToRender: {
            IdentityToRenderID: _recipientId,
            IdentityToRenderName: null,
            IdentityToRenderProfilePicture: null,
            IsOnline: false,
          },
          Message: `You exited ${chatroom?.ChatRoomName}`,
          Type: "User",
          Target: "group",
          Viewed: false,
        },
      ];
      general.postNotification(body);
    }

    console.log(response);
    refreshState((prev) => !prev);
  };

  useEffect(() => {
    getRequestStatus();
  }, [general.refreshState]);
  return (
    <>
      <div className={css.profile}>
        <div className={css["img-container"]}>
          <img
            src={
              chatroom?.ProfilePicture ? chatroom?.ProfilePicture : dummy?.src
            }
            alt=""
          />
        </div>
        <div className={css.name}>
          <p>
            <em>
              {chatroom?.ChatRoomName ? chatroom?.ChatRoomName : "John Doe"}
            </em>
          </p>
        </div>
        <div className={css["stats-container"]}>
          <div className={css.stats}>
            <div className={css["stat-child"]}>
              <p>
                <em>{chatroom?.Members?.length}</em>
                <em>Members</em>
              </p>
            </div>
            <div className={css["stat-child"]}>
              <p>
                <em>{chatroom?.Chats?.length}</em>
                <em>Chats</em>
              </p>
            </div>
          </div>
        </div>
        {chatroom?.ChatRoom_Owner !== userId && (
          <>
            <div className={css["btn-container"]}>
              {loading ? (
                <>
                  <p align="center">Loading...</p>
                </>
              ) : (
                <>
                  {requestStatus === 0 && (
                    <Button
                      onClick={sendRequest_User_Group}
                      disabled={disabled.requestDisabled}
                    >
                      <i className="fa-solid fa-user-plus"></i>
                      Join group
                    </Button>
                  )}
                  {requestStatus === 2 && (
                    <>
                      <div className={css.exit}>
                        <Button
                          className={css["btn-danger"]}
                          onClick={leaveGroup}
                        >
                          <i className="fa-solid fa-person-walking-arrow-right"></i>
                          Exit Group
                        </Button>
                      </div>
                    </>
                  )}
                  {requestStatus === 1 && (
                    <Button
                      className={css["btn-danger"]}
                      disabled={disabled.cancelDisabled}
                      onClick={cancelRequest}
                    >
                      <i className="fa-solid fa-ban"></i>
                      Cancel request
                    </Button>
                  )}
                </>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
};

const Accordion = (props) => {
  const [body, setBody] = useState(false);
  return (
    <>
      <div className={css.accordion}>
        <div className={css["tab-container"]}>
          <div
            className={css.tab}
            onClick={() => {
              setBody((prev) => !prev);
            }}
          >
            <div className={css["icon-container"]}>
              <i className={`${props.icon} ${props.iconClass}`}></i>
            </div>
            <div className={css.details}>
              <em>{props.title}</em>
              <em>{props.details}</em>
            </div>
            <div className={`${css["icon-container"]} ${css.next}`}>
              <i className="fa fa-greater-than"></i>
            </div>
          </div>
        </div>
        {body && <div className={css.body}>{props.children}</div>}
      </div>
    </>
  );
};

const EditChatroom = ({ chatroom, refreshState }) => {
  const general = useContext(General);
  const chatroomApiRoute = `${general.domain}api/chatroom/`;
  const config = { ...general.config };
  const [chatroomDetailsDisabled, setChatroomDetailsDisabled] = useState(false);
  const router = useRouter();
  const groupid = router.query?.groupid;
  const [accountDetails, setAccountDetails] = useState({
    ChatroomName: chatroom?.ChatRoomName,
    ProfilePicture: "",
  });
  const [error, setError] = useState({
    state: false,
    message: "",
  });

  const [src, setSrc] = useState(chatroom?.ProfilePicture);

  const fileOnChangeHandler = (e) => {
    setAccountDetails((prev) => ({
      ...prev,
      ProfilePicture: e.target.files[0],
    }));
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = (arg) => {
      setSrc(arg.target.result);
    };

    reader.readAsDataURL(file);
  };

  const chatroomDetailsHandler = async () => {
    const body = {
      ChatRoomName: accountDetails?.ChatroomName,
    };

    const response = await axios
      .put(`${chatroomApiRoute}${groupid}/details`, body, { ...config })
      .catch();

    if (response) {
      console.log("User details", response.data);
    }

    return response;
  };

  const formDataHandler = async () => {
    if (
      accountDetails.ProfilePicture !== null &&
      accountDetails.ProfilePicture !== "" &&
      accountDetails.ProfilePicture !== undefined
    ) {
      const _config = {
        headers: {
          ...config?.headers,
          "Content-type": "multipart/formdata",
          "Access-control-allow-origin": "*",
        },
      };

      const formData = new FormData();
      formData.append("body", accountDetails.ProfilePicture);

      const response = await axios
        .put(`${chatroomApiRoute}${groupid}`, formData, {
          ..._config,
        })
        .catch();

      if (response) {
        console.log("Form data", response);
      }
      return response;
    } else {
      return true;
    }
  };

  const chatroomDetailsSubmitHandler = async () => {
    setChatroomDetailsDisabled(true);

    const details = await chatroomDetailsHandler().catch((e) => {
      setError({
        state: true,
        message: "There was a problem with updating the group name...",
      });
    });

    const form = await formDataHandler().catch((e) => {
      setError({
        state: true,
        message: "There was a problem with updating the group image...",
      });
    });

    if (details && form) {
      setChatroomDetailsDisabled(false);
      refreshState((prev) => !prev);
    } else if (details && !form) {
      setChatroomDetailsDisabled(false);
      refreshState((prev) => !prev);
    } else if (!details && form) {
      setChatroomDetailsDisabled(false);
      refreshState((prev) => !prev);
    } else if (!(details && form)) {
      setChatroomDetailsDisabled(false);
      setError({
        state: true,
        message:
          "There was a problem with updating the the group name and image...",
      });
    }
  };

  useEffect(() => {
    setAccountDetails({
      ChatroomName: chatroom?.ChatRoomName,
      ProfilePicture: "",
    });
  }, []);

  return (
    <div className={css["edit-group"]}>
      <Form onSubmit={chatroomDetailsSubmitHandler}>
        {accountDetails.ProfilePicture === undefined ||
        accountDetails.ProfilePicture === "" ||
        accountDetails.ProfilePicture === null ? (
          <label className={css["img-upload"]}>
            <input type="file" hidden onChange={fileOnChangeHandler} />
            <div>
              <i className="fa-solid fa-cloud-arrow-up"></i>
            </div>
            <h3>Upload profile picture</h3>
          </label>
        ) : (
          <div className={css["img-container"]}>
            <img src={src} alt="" />
            <label>
              <input type="file" hidden onChange={fileOnChangeHandler} />
              <i className="fa fa-pencil"></i>
            </label>
          </div>
        )}

        <FormGroup
          icon="fa fa-user"
          value={accountDetails.ChatroomName}
          onChange={(e) => {
            setAccountDetails((prev) => ({
              ...prev,
              ChatroomName: e.target.value,
            }));
          }}
          placeholder="Enter Group name..."
          disabled={chatroomDetailsDisabled}
        />
        {error.state && <p className="error">{error.message}</p>}
        <Button disabled={chatroomDetailsDisabled}>
          {chatroomDetailsDisabled ? "Updating..." : "Update"}
        </Button>
      </Form>
    </div>
  );
};

const GroupMember = ({
  items,
  className,
  onClick,
  chatroomOwnerId,
  refreshState,
}) => {
  const general = useContext(General);
  const url = `${general.domain}api/chatroom`;
  const router = useRouter();
  const groupid = router.query?.groupid;
  const onDeleteClickHandler = async () => {
    const _confirm = window["confirm"](
      "Are you sure you want to remove this user from this group"
    );
    if (_confirm) {
      const response = await axios
        .delete(`${url}/${items?.UserID}/${groupid}`, general.config)
        .catch((e) => {});

      if (response) {
        refreshState((prev) => !prev);
      }
    }
  };

  useEffect(() => {}, []);
  return (
    <section className={`${css["group-members"]} ${className}`}>
      <div className={css["img-container"]}>
        <img
          src={
            items?.ProfilePicture === null || items?.ProfilePicture === ""
              ? dummy
              : items?.ProfilePicture
          }
          alt=""
        />
        <div
          className={`${css.status} ${
            items?.IsOnline ? css.online : css.offline
          }`}
        ></div>
      </div>
      <div className={css["details"]}>
        <p className={css["name"]}>{items?.UserName}</p>
        <p className={css["about"]}>
          {items?.Description?.length > 50
            ? items?.Description?.slice(0, 50) + "..."
            : items?.Description}
        </p>
      </div>
      <div className={css["icon-container"]}>
        {chatroomOwnerId === items?.UserID ? (
          <div style={{ color: "lightblue" }}>Admin</div>
        ) : (
          <div className={css["delete-icon"]} onClick={onDeleteClickHandler}>
            <i className="fa-solid fa-trash"></i>
          </div>
        )}
      </div>
    </section>
  );
};

const Invitations = (props) => {
  const general = useContext(General);
  const [sentRequests, setSentRequests] = useState([]);
  const [recievedRequests, setRecievedRequests] = useState([]);
  const url = `${general.domain}api/requests`;
  const router = useRouter();
  const groupid = router.query?.groupid;
  const getSentInvitations = async () => {
    const response = await axios
      .get(`${url}/sent/${groupid}`, general.config)
      .catch((e) => {});

    if (response) {
      if (response.data?.Data?.length > 0) {
        setSentRequests(response.data?.Data);
      } else {
        setSentRequests([]);
      }
    }
  };

  const getRecievedInvitations = async () => {
    const response = await axios
      .get(`${url}/recieved/${groupid}`, general.config)
      .catch((e) => {});

    if (response) {
      if (response.data?.Data?.length > 0) {
        setRecievedRequests(response.data?.Data);
      } else {
        setRecievedRequests([]);
      }
    }
  };

  const toogle = (e, tab_id) => {
    try {
      const links = document.querySelectorAll("#tab-link");
      const tabs = document.querySelectorAll(`.${css._tab}`);

      for (let i = 0; i < links.length; i++) {
        links[i].classList.remove(css.active);
      }
      for (let i = 0; i < tabs.length; i++) {
        tabs[i].classList.remove(css.active);
        tabs[i].className += ` ${css.inactive}`;
      }

      e.target.className += ` ${css.active}`;
      document.getElementById(tab_id).classList.remove(css.inactive);
      document.getElementById(tab_id).className += ` ${css.active}`;
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    getSentInvitations();
    getRecievedInvitations();
  }, [general.refreshState]);
  return (
    <div className={css["_tab-container"]}>
      <div className={css["_tab-head"]}>
        <ul>
          <li
            id={"tab-link"}
            onClick={(e) => {
              toogle(e, "sent");
            }}
            className={css.active}
          >
            Sent
          </li>
          <li
            id={"tab-link"}
            onClick={(e) => {
              toogle(e, "recieved");
            }}
          >
            Received
          </li>
        </ul>
      </div>
      <div className={`${css[`_tab-body`]}`}>
        <div className={`${css._tab} ${css.active}`} id="sent">
          {sentRequests?.length > 0 ? (
            <>
              {sentRequests?.map((eachRequest, i) => (
                <SentRequest key={i} items={eachRequest} />
              ))}
            </>
          ) : (
            <p align="center">No requests found</p>
          )}
        </div>
        <div className={`${css._tab} ${css.inactive}`} id="recieved">
          {recievedRequests?.length > 0 ? (
            <>
              {recievedRequests?.map((eachRequest, i) => (
                <RecievedRequest key={i} items={eachRequest} />
              ))}
            </>
          ) : (
            <p align="center">No requests found</p>
          )}
        </div>
      </div>
    </div>
  );
};

const Settings = ({ chatroom, refreshState, userId }) => {
  const general = useContext(General);

  const inviteMembers = () => {
    const componentToRender = {
      component: "invite",
      values: {
        groupid: chatroom?.ChatRoomID,
        groupName: chatroom?.ChatRoomName,
        userId: userId,
      },
    };

    sessionStorage.setItem(
      "componentToRender",
      JSON.stringify(componentToRender)
    );
    general.setModalState("true");
    sessionStorage.setItem("modalState", "true");
  };
  return (
    <>
      <div className={css.settings}>
        <div className={css.header}>
          <h1>Settings</h1>
        </div>
        <div className={css.accordions}>
          <div className={css["accordion-container"]}>
            <Accordion
              title="My Group"
              details="Edit and Update your group details"
              icon="fa fa-user"
            >
              <EditChatroom chatroom={chatroom} refreshState={refreshState} />
            </Accordion>
          </div>
          <div className={css["accordion-container"]}>
            <Accordion
              title="Members"
              details="Take a look at the your group members"
              icon="fa fa-users"
            >
              <div>
                <>
                  {chatroom?.Members?.length > 0 ? (
                    <>
                      {chatroom?.Members?.map((eachGroup) => (
                        <GroupMember
                          items={eachGroup}
                          chatroomOwnerId={chatroom?.ChatRoom_Owner}
                          onClick={() => {}}
                          refreshState={refreshState}
                        />
                      ))}
                    </>
                  ) : (
                    <p align="center">No member found...</p>
                  )}
                  <Button onClick={inviteMembers}>+ Invite new member</Button>
                </>
              </div>
            </Accordion>
          </div>
          <div className={css["accordion-container"]}>
            <Accordion
              title="Invitations"
              details="Manage your group's invitations"
              icon="fa fa-user-plus"
            >
              <Invitations />
            </Accordion>
          </div>
        </div>
      </div>
    </>
  );
};

const Notifications = ({ chatroom }) => {
  const [notifications, setNotifications] = useState([]);
  const general = useContext(General);
  const url = `${general.domain}api/notification`;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const chatroomId = chatroom?.ChatRoomID;
  let fetching = false;

  const getNotifications = async () => {
    setLoading(true);
    setError(false);
    const response = await axios
      .get(`${url}/${chatroom?.ChatRoomID}/group`, general.config)
      .catch((e) => {
        setLoading(false);
        setError(true);
      });
    if (response) {
      const data = response?.data?.Data;
      if (data?.length > 0) {
        setNotifications(data);
      } else {
        setNotifications([]);
      }

      setLoading(false);
      setError(false);
      // console.log(response);
    }
  };
  const refreshNotifications = async () => {
    if (!fetching) {
      fetching = true;
      const response = await axios
        .get(`${url}/${chatroom?.ChatRoomID}/group`)
        .catch((e) => {
          fetching = false;
        });
      if (
        Array.isArray(response?.data?.Data) &&
        response?.data?.Data?.length > 0
      ) {
        const newNotifications = [...response?.data?.Data];
        console.log("Data recieved", newNotifications);

        setNotifications(newNotifications);

        setTimeout(() => {
          fetching = false;
        }, 15000);
      }
    }
  };

  useEffect(() => {
    getNotifications();
    groupNotificationSocket.emit("join", chatroomId);
  }, []);

  useEffect(() => {
    groupNotificationSocket.on("connection", (message) => {
      console.log(message);
      groupNotificationSocket.emit("join", chatroomId);
    });
    groupNotificationSocket.on("notification", () => {
      console.log("User recieved a notification");

      refreshNotifications();
    });
  }, [groupNotificationSocket]);

  return (
    <div className={css.notifications}>
      <div className={css.header}>
        <h1>Notifications</h1>
      </div>
      <>
        {loading ? (
          <div className={css["loading-container"]}>
            <Loader />
          </div>
        ) : error ? (
          <div className={css["loading-container"]}>
            <ServerError />
          </div>
        ) : notifications.length < 1 ? (
          <>
            <p>No notifications</p>
          </>
        ) : (
          <>
            <div className={css.body}>
              {notifications?.map((eachNotification, i) => (
                <Notification items={eachNotification} key={i} />
              ))}
            </div>
          </>
        )}
      </>
    </div>
  );
};

const Members = ({ chatroom, userId }) => {
  const members = [...chatroom?.Members];
  const general = useContext(General);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const inviteMembers = () => {
    const componentToRender = {
      component: "invite",
      values: {
        groupid: chatroom?.ChatRoomID,
        groupName: chatroom?.ChatRoomName,
        userId: userId,
      },
    };

    sessionStorage.setItem(
      "componentToRender",
      JSON.stringify(componentToRender)
    );
    general.setModalState("true");
    sessionStorage.setItem("modalState", "true");
  };

  return (
    <div className={css.members}>
      <div className={css.header}>
        <h1>Members</h1>
      </div>
      <>
        {loading ? (
          <div className={css["loading-container"]}>
            <Loader />
          </div>
        ) : error ? (
          <div className={css["loading-container"]}>
            <ServerError />
          </div>
        ) : members.length < 1 ? (
          <>
            <p>
              No members in this group yet...You can invite some if you want
            </p>
          </>
        ) : (
          <>
            <div className={css.body}>
              {members?.map((eachMember, i) => (
                <UserProfile items={eachMember} key={i} />
              ))}
              <Button onClick={inviteMembers}>+ Invite new member</Button>
            </div>
          </>
        )}
      </>
    </div>
  );
};

const Group = (props) => {
  const [chatroom, setChatroom] = useState({});
  const [refreshState, setRefreshState] = useState(false);
  const general = useContext(General);
  const router = useRouter();
  const groupid = router.query?.groupid;
  const _groupid = groupid;
  const apiPrefix = general.domain;
  const config = general.config;
  const url = apiPrefix + `api`;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [userIsMember, setUserIsMember] = useState(false);

  const getChatroomProfile = async () => {
    setLoading(true);
    setError(false);

    const _url = `${url}/chatroom/${_groupid}/profile`;
    const res = await axios.get(_url, general.config).catch((e) => {
      console.log("Group error", e);
      if (e.request) {
        setLoading(false);
        setError(true);
      }
    });
    const data = res?.data?.Data;
    if (data !== null) {
      data?.map((_chatroom) => {
        setChatroom(_chatroom);
        if (
          _chatroom?.Members?.filter(
            (eachMember) => eachMember?.UserID === props.userId
          )?.length > 0
        ) {
          setUserIsMember(true);
        } else {
          false;
        }
        setLoading(false);
        setError(false);
      });
    } else {
      setLoading(false);
      setError(false);
      setChatroom({});
    }
  };

  const deleteGroup = () => {
    const componentToRender = {
      component: "deleteGroup",
      values: {
        groupid: chatroom?.ChatRoomID,
        groupName: chatroom?.ChatRoomName,
        userId: props.userId,
        groupMembers: chatroom?.Members,
      },
    };

    sessionStorage.setItem(
      "componentToRender",
      JSON.stringify(componentToRender)
    );
    general.setModalState("true");
    sessionStorage.setItem("modalState", "true");
  };

  useEffect(() => {
    getChatroomProfile();
    return () => {};
  }, [groupid, refreshState]);
  return (
    <>
      {loading ? (
        <div className={css["loading-container"]}>
          <Loader />
        </div>
      ) : error ? (
        <div className={css["loading-container"]}>
          <ServerError />
        </div>
      ) : Object.keys(chatroom).length === 0 ? (
        <>
          <NoItem message={"This group does not exist"} />
        </>
      ) : (
        <section className={css.group}>
          <div className={css.profile}>
            <Profile
              chatroom={chatroom}
              refreshState={setRefreshState}
              userId={props.userId}
            />
          </div>
          {chatroom?.ChatRoom_Owner === props.userId && (
            <div className={css.setting}>
              <Settings
                chatroom={chatroom}
                refreshState={setRefreshState}
                userId={props.userId}
              />
            </div>
          )}
          {userIsMember && (
            <>
              <Notifications chatroom={chatroom} userId={props.userId} />
              <Members chatroom={chatroom} userId={props.userId} />
            </>
          )}

          {chatroom?.ChatRoom_Owner === props.userId && (
            <div className={css["danger-zone"]}>
              <h1>Danger Zone !</h1>
              <Button className={css["btn-danger"]} onClick={deleteGroup}>
                <i className="fa-solid fa-trash"></i>
                Delete Group
              </Button>
            </div>
          )}
        </section>
      )}
    </>
  );
};

export default Group;

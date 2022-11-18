import axios from "axios";
import React, { useEffect, useState } from "react";
import { useContext } from "react";
import { General } from "../../context/GeneralContext";
import { Button } from "../Button/Button";
import { emitMessage } from "../ChatEngine/ChatBlock/ChatBlock";
import { PostNotification } from "../ChatEngine/Notifications/Notifications";
import { Form, FormGroup } from "../Form/Form";
import Glassmorphism from "../Glassmorphism/Glassmorphism";
import css from "./Modal.module.css";
import { v4 as uuidV4 } from "uuid";
import { useRouter } from "next/router";
import dummy from "../../assets/images/dummy-img.png";
import NoItem from "../NoItem/NoItem";

const RemoveFella = ({ items }) => {
  const general = useContext(General);
  const [password, setPassword] = useState("");
  const [error, setError] = useState({
    state: false,
    message: "",
  });
  const apiPrefix = general.domain;
  const config = general.config;
  const url = apiPrefix + `api/chatroom`;
  const [disabled, setDisabled] = useState(false);

  const blockFella = async () => {
    setDisabled(true);
    const ip = await axios
      .get("https://geolocation-db.com/json/")
      .catch((e) => {
        console.log(e);
      });

    const base64IP = general.toBase64(ip?.data?.IPv4);
    const base64Password = general.toBase64(password);

    const response = await axios
      .delete(
        `${url}/${items?.From_ID}/${items?.To_ID}/${base64IP}/${base64Password}/block`,
        { ...config }
      )
      .catch((e) => {
        setDisabled(false);
      });

    if (response) {
      let senderName;
      let receiverName;
      const sender = await axios
        .get(`${general.domain}api/user/${items?.From_ID}`)
        .catch();
      const receiver = await axios
        .get(`${general.domain}api/user/${items?.To_ID}`)
        .catch();

      for (var _user of sender?.data?.Data) {
        senderName = _user?.UserName;
      }

      for (var __user of receiver?.data?.Data) {
        receiverName = __user?.UserName;
      }

      const body = [
        {
          ID: 0,
          UserID: items?.From_ID,
          IdentityToRender: {
            IdentityToRenderID: items?.To_ID,
            IdentityToRenderName: null,
            IdentityToRenderProfilePicture: null,
            IsOnline: false,
          },
          Message: `You blocked ${receiverName}`,
          Type: "User",
          Target: "users",
          Viewed: false,
        },
        {
          ID: 0,
          UserID: items?.To_ID,
          IdentityToRender: {
            IdentityToRenderID: items?.From_ID,
            IdentityToRenderName: null,
            IdentityToRenderProfilePicture: null,
            IsOnline: false,
          },
          Message: `You have been blocked by ${senderName}`,
          Type: "User",
          Target: "users",
          Viewed: false,
        },
      ];
      general.postNotification(body);

      if (response.data.ResponseCode === 200) {
        setDisabled(false);

        setError({
          state: false,
          message: "",
        });

        general.setModalState("false");
        sessionStorage.setItem("modalState", "false");
        sessionStorage.removeItem("componentToRender");
      } else {
        setDisabled(false);

        setError({
          state: true,
          message: "Incorrect password!",
        });
      }
    } else {
      setDisabled(false);
    }

    console.log(response);
    general.setRefreshState((prev) => !prev);
  };

  return (
    <>
      <div className={css["remove-fella"]}>
        <p className={css.header}>
          Removing this fella will delete the chatroom you both share and all
          it's contents including it's members. Are you sure you wan't to go on
          with it, if yes input your password else just cancel
        </p>
        <Form>
          <FormGroup
            icon="fa fa-key"
            placeholder="Enter your password to continue"
            value={password}
            type="password"
            onChange={(e) => {
              setPassword(e.target.value);
            }}
          />
          {error.state && <p className="error">{error.message}</p>}

          <Button
            className={css["btn-danger"]}
            disabled={disabled}
            onClick={blockFella}
          >
            <i className="fa-solid fa-ban"></i>
            {disabled ? "Loading" : "Block Fella"}
          </Button>
        </Form>
      </div>
    </>
  );
};

const EditChat = ({ items }) => {
  const general = useContext(General);
  const [chatMessage, setChatMessage] = useState(items?.Message);
  const [error, setError] = useState({
    state: false,
    message: "",
  });
  const apiPrefix = general.domain;
  const config = general.config;
  const url = apiPrefix + `api/chats`;
  const [disabled, setDisabled] = useState(false);

  const sendChat = async () => {
    setDisabled(true);
    const response = await axios
      .put(
        `${url}`,
        {
          Message: chatMessage,
          ChatID: items?.ChatID,
        },
        { ...config }
      )
      .catch((e) => {
        setError({ state: true, message: "Network error" });
        setDisabled(false);
      });

    if (response) {
      setDisabled(false);
      emitMessage(items);

      general.setUpdateChat((prev) => ({
        ...prev,
        state: !prev.state,
        details: {
          ChatID: items?.ChatID,
          Message: chatMessage,
        },
      }));

      general.setModalState("false");
      sessionStorage.setItem("modalState", "false");
      sessionStorage.removeItem("componentToRender");
    }
  };

  return (
    <>
      <div className={css["edit-chat"]}>
        <Form className={css.form}>
          <FormGroup
            icon="fa-solid fa-face-smile"
            placeholder="Enter your message"
            value={chatMessage}
            type="text"
            onChange={(e) => {
              setChatMessage(e.target.value);
            }}
          />
          <Button onClick={sendChat} className={css.send} disabled={disabled}>
            <i className="fa-solid fa-paper-plane"></i>
            {disabled ? "Updating..." : "Update Message"}
          </Button>
        </Form>
        {error.state && (
          <em style={{ fontStyle: "normal" }} className="error">
            {error.message}
          </em>
        )}
      </div>
    </>
  );
};

const NewGroup = () => {
  const general = useContext(General);
  const navigate = useRouter();
  const url = `${general.domain}api/chatroom`;
  const [src, setSrc] = useState("");
  const [userDetailsDisabled, setUserDetailsDisabled] = useState(false);
  const [accountDetails, setAccountDetails] = useState({
    ChatRoomName: "",
    Description: "",
    ProfilePicture: "",
  });
  const [error, setError] = useState({
    state: false,
    message: "",
  });

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

  const submitDetails = async (chatroom) => {
    const response = await axios
      .post(
        url,
        {
          ChatRoomID: chatroom?.chatRoomID,
          ChatRoomName: chatroom?.chatRoomName,
          Description: chatroom?.description,
        },
        general.config
      )
      .catch((e) => {});

    return response;
  };

  const submitImage = async (chatroomid) => {
    const config = {
      headers: {
        ...general.config.headers,
        "Content-type": "multipart/form-data",
      },
    };

    const formData = new FormData();

    formData.append("body", accountDetails.ProfilePicture);

    const response = await axios
      .put(`${url}/${chatroomid}`, formData, config)
      .catch((e) => {});

    return response;
  };

  const onSubmitHandler = async () => {
    setUserDetailsDisabled(true);

    const chatroomId = `CHATROOM_${uuidV4()}`;
    const chatroom = {
      chatRoomID: chatroomId,
      chatRoomName: accountDetails.ChatRoomName,
      description: accountDetails.Description,
    };
    const detailsResponse = await submitDetails(chatroom).catch((e) => {
      setUserDetailsDisabled(false);
      setError({
        state: true,
        message: "There was an error creating your group, please try again",
      });
    });

    if (detailsResponse.data?.ResponseCode === 200) {
      // console.log("I got here and the details response code is 200");
      if (
        accountDetails.ProfilePicture !== null &&
        accountDetails.ProfilePicture !== "" &&
        accountDetails.ProfilePicture !== undefined
      ) {
        const imageResponse = await submitImage(chatroom.chatRoomID).catch(
          (e) => {
            setUserDetailsDisabled(false);
            // console.log(
            //   "I got here and there is an issue in uploading the image"
            // );
          }
        );
        if (imageResponse) {
          setUserDetailsDisabled(false);
          // console.log("I got here, details and image uploaded successfully");
        }
        setError({
          state: false,
          message: "",
        });
        //NAVIGATE TO GROUP DETAILS AND CLOSE MODAL
        general.setModalState("false");
        sessionStorage.setItem("modalState", "false");
        sessionStorage.removeItem("componentToRender");
        navigate(`chat/group/${chatroom.chatRoomID}`);
      } else {
        // console.log(
        //   "I got here and the details response code is not " +
        //     200 +
        //     " but is" +
        //     detailsResponse?.data?.ResponseCode
        // );

        setUserDetailsDisabled(false);

        setError({
          state: false,
          message: "",
        });
        //NAVIGATE TO GROUP DETAILS AND CLOSE MODAL
        general.setModalState("false");
        sessionStorage.setItem("modalState", "false");
        sessionStorage.removeItem("componentToRender");
        navigate(`chat/group/${chatroom.chatRoomID}`);
      }
    } else {
      setUserDetailsDisabled(false);
      setError({
        state: true,
        message: "There was an error creating your group, please try again",
      });
    }
  };

  return (
    <Form className={css["new-group"]} onSubmit={onSubmitHandler}>
      {accountDetails.ProfilePicture === undefined ||
      accountDetails.ProfilePicture === "" ||
      accountDetails.ProfilePicture === null ? (
        <label className={css["img-upload"]}>
          <input type="file" hidden onChange={fileOnChangeHandler} />
          <div>
            <i className="fa-solid fa-cloud-arrow-up"></i>
          </div>
          <h3>Upload group picture</h3>
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
        value={accountDetails.ChatRoomName}
        onChange={(e) => {
          setAccountDetails((prev) => ({
            ...prev,
            ChatRoomName: e.target.value,
          }));
        }}
        placeholder="Enter group name..."
        disabled={userDetailsDisabled}
        required={true}
      />
      <Button disabled={userDetailsDisabled}>
        {userDetailsDisabled ? "Creating..." : "Create"}
      </Button>
    </Form>
  );
};

const UserProfile = ({ items, className, onChange, removeItem }) => {
  const general = useContext(General);
  const onCheckChanged = (e) => {
    if (e.target?.checked) {
      onChange(items);
    } else {
      removeItem(items);
    }
  };
  return (
    <section className={`${css["sidebar-user-profile"]} ${className}`}>
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
            ? items?.Description.slice(0, 50) + "..."
            : items?.Description}
        </p>
      </div>
      <label>
        <div className={"switch"}>
          <input
            type="checkbox"
            name={items?.UserID?.split("-")[0]}
            value={"user"}
            id="selectUser"
            onChange={onCheckChanged}
          />
          <span className={"slider round"}></span>
        </div>
      </label>
    </section>
  );
};

const InviteMembers = ({ items }) => {
  const general = useContext(General);
  const url = `${general.domain}api/chatroom`;
  const [myFellas, setMyFellas] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [backupUsers, setBackupUsers] = useState([]);
  const [users, setUsers] = useState([]);
  const [itemsToSubmit, setItemsToSubmit] = useState([]);
  const [disabled, setDisabled] = useState();
  const senderId = localStorage.getItem("UserId");

  const getMyFellas = async () => {
    const response = await axios
      .get(`${url}/${items?.groupid}/fellas/group`, general.config)
      .catch((e) => {});
    if (response) {
      const data = response?.data?.Data;
      if (data?.length > 0) {
        setMyFellas(data);
        setUsers(data);
        setBackupUsers(data);
        // console.log("My fellas", data);
      }
    }
  };

  const getAllUsers = async () => {
    const response = await axios
      .get(`${url}/${items?.groupid}/users/group`, general.config)
      .catch((e) => {});
    if (response) {
      const data = response?.data?.Data;
      if (data?.length > 0) {
        setAllUsers(data);
        // console.log("All users", data);
      }
    }
  };

  const selectType = (e) => {
    if (e?.target?.id === "fellasOnly" && e?.target?.checked) {
      setBackupUsers(myFellas);
      setUsers(myFellas);
    } else if (e?.target?.id === "allUsers" && e?.target?.checked) {
      setBackupUsers(allUsers);
      setUsers(allUsers);
    }
    // console.log(e?.target?.id);
    // console.log(e?.target?.checked);
  };

  const removeItemHandler = (newItem) => {
    setItemsToSubmit((prev) =>
      prev?.filter((prevItems) => prevItems?.UserID !== newItem?.UserID)
    );
  };

  const onChangeHandler = (newItem) => {
    const find = itemsToSubmit.filter(
      (item) => item?.UserID === newItem?.UserID
    );
    if (find?.length > 0) {
    } else {
      setItemsToSubmit((prev) => [...prev, { ...newItem }]);
      // console.log(newItem);
    }
  };

  const selectAll = (e) => {
    if (e?.target?.checked) {
      const allItems = document.querySelectorAll("#selectUser");
      for (let i = 0; i < allItems.length; i++) {
        allItems[i].checked = true;
      }

      setItemsToSubmit([...users]);
      console.log(users);
    } else {
      const allItems = document.querySelectorAll("#selectUser");
      for (let i = 0; i < allItems.length; i++) {
        allItems[i].checked = false;
      }

      for (const user of users) {
        setItemsToSubmit((prev) =>
          prev?.filter((prevItems) => prevItems?.UserID !== user?.UserID)
        );
      }
    }
  };

  const removeOne = (userid) => {
    const selected = document.getElementsByName(userid?.split("-")[0]);
    for (const name of selected) {
      name.checked = false;
    }

    setItemsToSubmit((prev) =>
      prev?.filter((prevItems) => prevItems?.UserID !== userid)
    );
  };

  const searchHandler = (string) => {
    if (string !== "" && string !== null) {
      setUsers((prev) =>
        prev.filter((eachUser) =>
          eachUser?.UserName?.toLowerCase()?.includes(string?.toLowerCase())
        )
      );
    } else {
      setUsers(backupUsers);
    }
  };

  const sendRequest_Group_User = async (reciever) => {
    // setDisabled(true);

    const userResponse = await axios
      .get(`${general.domain}api/user/${senderId}`, { ...general.config })
      .catch((e) => {
        //  console.log(e);
      });

    let sender;

    userResponse?.data?.Data?.map((eachUser) => {
      sender = eachUser;
    });

    const body = {
      From: { UserID: items?.groupid },
      To: { UserID: reciever?.UserID },
      Message: `Hello...My name is ${sender?.UserName}, and i would to invite you to this group`,
      From_Type: "Group",
      To_Type: "User",
    };

    const _url = `${general.domain}api/request`;

    const response = await axios
      .post(_url, body, { ...general.config })
      .catch((e) => {
        // setDisabled(false)
        // console.log(e);
      });

    if (response?.data?.ResponseCode === 200) {
      const body = [
        {
          ID: 0,
          UserID: items?.groupid,
          IdentityToRender: {
            IdentityToRenderID: reciever?.UserID,
            IdentityToRenderName: null,
            IdentityToRenderProfilePicture: null,
            IsOnline: false,
          },
          Message: `You sent an invitation to ${reciever?.UserName}`,
          Type: "User",
          Target: "",
          Viewed: false,
        },
        {
          ID: 0,
          UserID: reciever?.UserID,
          IdentityToRender: {
            IdentityToRenderID: items?.groupid,
            IdentityToRenderName: null,
            IdentityToRenderProfilePicture: null,
            IsOnline: false,
          },
          Message: `You recieved a request from ${items?.groupName}`,
          Type: "Group",
          Target: "requests",
          Viewed: false,
        },
      ];
      general.postNotification(body);

      // setDisabled(false);
    }

    // console.log(response);
  };

  const sendInvitations = async () => {
    setDisabled(true);
    for (let i = 0; i < itemsToSubmit.length; i++) {
      const response = await sendRequest_Group_User(itemsToSubmit[i]);
      console.log(
        `Invitation to ${itemsToSubmit[i]?.UserName} sent successfully`
      );

      if (i === itemsToSubmit.length - 1) {
        general.setModalState("false");
        sessionStorage.setItem("modalState", "false");
        sessionStorage.removeItem("componentToRender");

        console.log("Last invitation sent successfully");
        break;
      }
    }
  };

  useEffect(() => {
    getAllUsers();
    getMyFellas();
  }, []);

  return (
    <div className={css.invite}>
      <h1>Invite new members</h1>
      {itemsToSubmit?.length > 0 && (
        <div className={css["members-to-add"]}>
          {itemsToSubmit?.map((eachItem, i) => (
            <div key={i} className={css["each-member"]}>
              <em>{eachItem?.UserName}</em>
              <em
                className="error"
                style={{ fontWeight: "bold", cursor: "pointer" }}
                onClick={() => {
                  removeOne(eachItem?.UserID);
                }}
              >
                X
              </em>
            </div>
          ))}
        </div>
      )}
      <div className={css.options}>
        <label htmlFor="fellasOnly">
          Fella's only(Display only a list of users in which you are fella's
          with)
          <div className={css.switch}>
            <input
              type="radio"
              name="selecType"
              value={"fellasOnly"}
              id="fellasOnly"
              onChange={selectType}
              // checked={true}
            />
            <span className={`${css.slider} ${css.round}`}></span>
          </div>
        </label>
        <label htmlFor="allUsers">
          All users(Display a list of random users which are not members of this
          group)
          <div className={css.switch}>
            <input
              type="radio"
              name="selecType"
              value={"allUsers"}
              id="allUsers"
              onChange={selectType}
            />
            <span className={`${css.slider} ${css.round}`}></span>
          </div>
        </label>
      </div>
      <Form className={css.search}>
        <FormGroup
          placeholder="Search for people..."
          icon="fas fa-magnifying-glass"
          onChange={(e) => {
            searchHandler(e?.target?.value);
          }}
        />
      </Form>
      <div className={css.users}>
        <label className={css.head}>
          <div className={css.switch}>
            <input
              type="checkbox"
              name="sellectAll"
              value={"all"}
              id="sellectAll"
              onChange={selectAll}
            />
            <span className={`${css.slider} ${css.round}`}></span>
          </div>
          Select all
        </label>
        <div className={css.items}>
          {users?.length > 0 ? (
            <>
              {users.map((each) => (
                <UserProfile
                  items={each}
                  onChange={onChangeHandler}
                  removeItem={removeItemHandler}
                />
              ))}
            </>
          ) : (
            <p align="center">No item found</p>
          )}
        </div>
      </div>
      <Button
        className={css.send}
        onClick={sendInvitations}
        disabled={disabled}
      >
        <i className="fa-solid fa-paper-plane"></i>{" "}
        {disabled ? "Sending invitations..." : "Send Invitations"}
      </Button>
    </div>
  );
};

const Modal = () => {
  const general = useContext(General);
  const [componentToRender, setComponentToRender] = useState({
    ...JSON.parse(sessionStorage.getItem("componentToRender")),
  });

  useEffect(() => {
    setComponentToRender({
      ...JSON.parse(sessionStorage.getItem("componentToRender")),
    });
    return () => {};
  }, [general.refreshState]);

  return (
    <>
      <div className={css.modal}>
        <div
          className={css.bg}
          onClick={() => {
            general.setModalState("false");
            sessionStorage.setItem("modalState", "false");
            sessionStorage.removeItem("componentToRender");
          }}
        ></div>
        <Glassmorphism className={css.body}>
          {componentToRender.component === "RemoveFella" && (
            <>
              <RemoveFella items={componentToRender.values} />
            </>
          )}
          {componentToRender.component === "EditChat" && (
            <>
              <EditChat items={componentToRender.values} />
            </>
          )}
          {componentToRender.component === "newGroup" && (
            <>
              <NewGroup />
            </>
          )}
          {componentToRender.component === "invite" && (
            <>
              <InviteMembers items={componentToRender.values} />
            </>
          )}
        </Glassmorphism>
      </div>
    </>
  );
};

export default Modal;

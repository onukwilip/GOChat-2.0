import React, { useContext, useEffect, useState } from "react";
import css from "./User.module.css";
import dummy from "../../../assets/images/dummy-img.png";
import axios from "axios";
import { General } from "../../../context/GeneralContext";
import { useRouter } from "next/router";
import { Form, FormGroup } from "../../Form/Form";
import { Button } from "../../Button/Button";
import Loader from "../../Loader/Loader";
import ServerError from "../../ServerError/ServerError";
import { PostNotification } from "../Notifications/Notifications";
import { ChatRoomProfile } from "../Sidebar/Sidebar";

const Profile = ({ user, userId }) => {
  const [requestStatus, setRequestStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const general = useContext(General);
  const router = useRouter();
  const userid = router.query?.userid;
  const _recipientId = general.fromBase64(userid);
  const apiPrefix = general.domain;
  const config = general.config;
  const url = apiPrefix + `api`;
  const [senderId, setSenderId] = useState(userId);
  const [disabled, setDisabled] = useState({
    cancelDisabled: false,
    requestDisabled: false,
  });

  const getRequestStatus = async () => {
    setLoading(true);

    const _url = `${url}/requests/verify/${senderId}/${_recipientId}`;
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

  const sendRequest_User_User = async () => {
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
      Message: `Hello...My name is ${user_?.UserName}, Can we be friends?`,
      From_Type: "User",
      To_Type: "User",
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

    if (response) {
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
          Message: `You sent a request to ${user?.UserName}`,
          Type: "User",
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

    console.log(response);
    general.setRefreshState((prev) => !prev);
  };

  const cancelRequest = async () => {
    setDisabled((prev) => ({
      ...prev,
      cancelDisabled: true,
    }));

    const ip = await axios
      .get("https://geolocation-db.com/json/")
      .catch((e) => {
        setDisabled((prev) => ({
          ...prev,
          cancelDisabled: false,
        }));
        console.log(e);
      });

    const _url = `${url}/requests/delete/${senderId}/${general.toBase64(
      ip.data.IPv4
    )}/${_recipientId}`;

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
          Message: `You cancelled your request to ${user?.UserName}`,
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
    general.setRefreshState((prev) => !prev);
  };

  const blockFella = async () => {
    const componentToRender = {
      component: "RemoveFella",
      values: {
        From_ID: senderId,
        To_ID: _recipientId,
      },
    };

    sessionStorage.setItem(
      "componentToRender",
      JSON.stringify(componentToRender)
    );
    general.setModalState("true");
    sessionStorage.setItem("modalState", "true");
  };

  const ignoreFella = async () => {
    const ip = await axios
      .get("https://geolocation-db.com/json/")
      .catch((e) => {
        console.log(e);
      });

    const base64IP = general.toBase64(ip?.data?.IPv4);
    const response = await axios.delete(
      `${url}/chatroom/${senderId}/${_recipientId}/${base64IP}/ignore`,
      { ...config }
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
          Message: `You ignored ${user?.UserName}`,
          Type: "User",
          Target: "users",
          Viewed: false,
        },
      ];
      general.postNotification(body);
    }

    console.log(response);
    general.setRefreshState((prev) => !prev);
  };

  const unIgnoreFella = async () => {
    const ip = await axios
      .get("https://geolocation-db.com/json/")
      .catch((e) => {
        console.log(e);
      });

    const base64IP = general.toBase64(ip?.data?.IPv4);
    const response = await axios.post(
      `${url}/chatroom/${senderId}/${_recipientId}/${base64IP}/unignore`,
      {},
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
          Message: `You unignored ${user?.UserName}`,
          Type: "User",
          Target: "users",
          Viewed: false,
        },
      ];
      general.postNotification(body);
    }

    console.log(response);
    general.setRefreshState((prev) => !prev);
  };

  useEffect(() => {
    getRequestStatus();
    setSenderId(userId);
  }, [general.refreshState]);
  return (
    <>
      <div className={css.profile}>
        <div className={css["img-container"]}>
          <img
            src={user?.ProfilePicture ? user?.ProfilePicture : dummy}
            alt=""
          />
        </div>
        <div className={css.name}>
          <p>
            <em>{user?.UserName ? user?.UserName : "John Doe"}</em>
            <em>
              {user?.Description
                ? user?.Description
                : "Lorem ipsum dolor, sit amet consectetur adipisicing elit. Numquam minus, alias recusandae amet temporibus ut veritatis placeat iste quo molestiae."}
            </em>
          </p>
        </div>
        <div className={css["stats-container"]}>
          <div className={css.stats}>
            <div className={css["stat-child"]}>
              <p>
                <em>134</em>
                <em>Fellas</em>
              </p>
            </div>
            <div className={css["stat-child"]}>
              <p>
                <em>1000</em>
                <em>Chats</em>
              </p>
            </div>
            <div className={css["stat-child"]}>
              <p>
                <em>10</em>
                <em>Groups</em>
              </p>
            </div>
          </div>
        </div>
        {user.UserID !== userId && (
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
                      onClick={sendRequest_User_User}
                      disabled={disabled.requestDisabled}
                    >
                      <i className="fa-solid fa-user-plus"></i>
                      Add fella
                    </Button>
                  )}
                  {requestStatus === 2 && (
                    <Button className={css["btn-danger"]} onClick={ignoreFella}>
                      <i className="fa-solid fa-user-slash"></i>
                      Ignore fella
                    </Button>
                  )}
                  {requestStatus === 3 && (
                    <Button onClick={unIgnoreFella}>
                      <i className="fa-solid fa-user-plus"></i>
                      Unignore fella
                    </Button>
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
            {requestStatus !== 0 && requestStatus !== 1 && (
              <div className={css["danger-zone"]}>
                <h1>Danger Zone !</h1>
                <Button className={css["btn-danger"]} onClick={blockFella}>
                  <i className="fa-solid fa-ban"></i>
                  Block fella
                </Button>
              </div>
            )}
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

const EditUser = ({ user }) => {
  const general = useContext(General);
  const userApiRoute = `${general.domain}api/user/`;
  const config = { ...general.config };
  const [userDetailsDisabled, setUserDetailsDisabled] = useState(false);
  const [passwordDisabled, setPasswordDisabled] = useState(false);
  const [userDetailsError, setUserDetailsError] = useState({
    state: false,
    message: "",
  });

  const [passwordError, setPasswordError] = useState({
    state: false,
    message: "",
  });

  const [accountDetails, setAccountDetails] = useState({
    UserName: user?.UserName,
    Email: user?.Email,
    Description: user?.Description,
    ProfilePicture: "",
  });

  const [passwordDetails, setPasswordDetails] = useState({
    OldPassword: "",
    NewPassword: "",
    RetypePassword: "",
  });
  const [src, setSrc] = useState(user?.ProfilePicture);

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

  const UserDetilsHandler = (ip) => {
    setUserDetailsDisabled(true);

    const body = {
      ...accountDetails,
      ProfilePicture: "",
    };

    axios
      .put(
        `${userApiRoute}${user.UserID}/${general.toBase64(ip.data.IPv4)}/`,
        body,
        { ...config }
      )
      .then((res) => {
        console.log("User details", res.data);
        setUserDetailsDisabled(false);
      })
      .catch();
  };

  const FromDataHandler = (ip) => {
    const _config = {
      headers: {
        ...config?.headers,
        "Content-type": "multipart/formdata",
        "Access-control-allow-origin": "*",
      },
    };

    if (
      accountDetails.ProfilePicture !== undefined &&
      accountDetails.ProfilePicture !== "" &&
      accountDetails.ProfilePicture !== null
    ) {
      const formData = new FormData();
      formData.append("body", accountDetails.ProfilePicture);

      axios
        .put(
          `${userApiRoute}file/${user.UserID}/${general.toBase64(
            ip.data.IPv4
          )}`,
          formData,
          { ..._config }
        )
        .then((res) => {
          console.log("Form data", res);
        })
        .catch();
    }
  };

  const userDetailsSubmitHandler = async () => {
    const ip = await axios.get("https://geolocation-db.com/json/");

    UserDetilsHandler(ip);
    FromDataHandler(ip);

    general.setRefreshState((prev) => !prev);
  };

  const changePasswordSubmitHandler = async () => {
    setPasswordDisabled(true);
    const ip = await axios.get("https://geolocation-db.com/json/");
    const url = `${userApiRoute}password/${user?.UserID}/${general.toBase64(
      ip.data.IPv4
    )}`;
    const body = {
      ...passwordDetails,
    };

    if (passwordDetails.NewPassword === passwordDetails.RetypePassword) {
      const response = await axios.put(url, body, config);
      if (response) {
        setPasswordDisabled(false);
        if (response.data.ResponseCode === 400) {
          setPasswordError({
            state: true,
            message: "*Old password is not correct",
          });
        }
      }
      console.log("Password response", response.data);
    } else {
      setPasswordDisabled(false);

      console.log(
        "Password response: New password and retype password MUST match"
      );
      setPasswordError({
        state: true,
        message: "*Password and retype password must match...",
      });
    }

    setPasswordDetails({
      OldPassword: "",
      NewPassword: "",
      RetypePassword: "",
    });
  };

  useEffect(() => {
    setAccountDetails({
      UserName: user?.UserName,
      Email: user?.Email,
      Description: user?.Description,
      ProfilePicture: "",
    });
    console.log(user?.Description);
    // setSrc(user?.ProfilePicture);
    return () => {};
  }, []);

  return (
    <div className={css["edit-user"]}>
      <Form onSubmit={userDetailsSubmitHandler}>
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
          value={accountDetails.UserName}
          onChange={(e) => {
            setAccountDetails((prev) => ({
              ...prev,
              UserName: e.target.value,
            }));
          }}
          placeholder="Enter Username..."
          disabled={userDetailsDisabled}
        />
        <FormGroup
          icon="fa fa-envelope"
          value={accountDetails.Email}
          onChange={(e) => {
            setAccountDetails((prev) => ({
              ...prev,
              Email: e.target.value,
            }));
          }}
          placeholder="Enter Email..."
          disabled={userDetailsDisabled}
        />
        <FormGroup
          type="textarea"
          onChange={(e) => {
            setAccountDetails((prev) => ({
              ...prev,
              Description: e.target.value,
            }));
          }}
          placeholder="Tell us about yourself..."
          disabled={userDetailsDisabled}
        >
          {user?.Description}
        </FormGroup>
        <Button disabled={userDetailsDisabled}>
          {userDetailsDisabled ? "Updating..." : "Update"}
        </Button>
      </Form>

      <Form onSubmit={changePasswordSubmitHandler}>
        <div className={css.password}>
          <h3>Change Password</h3>
          <FormGroup
            icon="fa fa-key"
            onChange={(e) => {
              setPasswordDetails((prev) => ({
                ...prev,
                OldPassword: e.target.value,
              }));
            }}
            placeholder="Old password..."
            type="password"
            required={true}
            value={passwordDetails.OldPassword}
          />
          <FormGroup
            icon="fa fa-key"
            onChange={(e) => {
              setPasswordDetails((prev) => ({
                ...prev,
                NewPassword: e.target.value,
              }));
            }}
            placeholder="New password..."
            type="password"
            required={true}
            value={passwordDetails.NewPassword}
          />
          <FormGroup
            icon="fa fa-key"
            onChange={(e) => {
              setPasswordDetails((prev) => ({
                ...prev,
                RetypePassword: e.target.value,
              }));
            }}
            placeholder="Retype password..."
            type="password"
            required={true}
            value={passwordDetails.RetypePassword}
          />
          {passwordError.state ? (
            <p className="error" style={{ textAlign: "center", width: "100%" }}>
              {passwordError.message}
            </p>
          ) : null}
          <Button disabled={passwordDisabled}>
            {passwordDisabled ? "Updating..." : "Change"}
          </Button>
        </div>
      </Form>
    </div>
  );
};

const Settings = ({ user }) => {
  return (
    <>
      <div className={css.settings}>
        <div className={css.header}>
          <h1>Settings</h1>
        </div>
        <div className={css.accordions}>
          <Accordion
            title="My Account"
            details="Update your profile details"
            icon="fa fa-user"
          >
            <EditUser user={user} />
          </Accordion>
          <Accordion
            title="Appearance"
            details="Customise the look of GOChat"
            icon="fa fa-pen-fancy"
          ></Accordion>
          <Accordion
            title="Groups"
            details="View and edit the list of groups you created"
            icon="fa fa-users"
          >
            <Groups userid={user?.UserID} />
          </Accordion>
        </div>
      </div>
    </>
  );
};

const Groups = ({ userid }) => {
  const navigate = useRouter();
  const [groups, setGroups] = useState([]);
  const [loader, setLoader] = useState(false);
  const [error, setError] = useState(false);
  const general = useContext(General);

  const getGroups = async () => {
    setLoader(true);
    setError(false);
    const url = `${general.domain}api/chatroom/user-groups`;
    const response = await axios.get(url, general.config).catch((e) => {
      setLoader(false);
      setError(true);
    });

    if (response) {
      setError(false);
      setLoader(false);
      setGroups(response.data?.Data);
    }
  };

  const newGroup = async () => {
    const componentToRender = {
      component: "newGroup",
      values: {},
    };

    sessionStorage.setItem(
      "componentToRender",
      JSON.stringify(componentToRender)
    );
    general.setModalState("true");
    sessionStorage.setItem("modalState", "true");
  };

  useEffect(() => {
    getGroups();
  }, []);

  return (
    <div>
      {loader ? (
        <Loader />
      ) : error ? (
        <ServerError />
      ) : (
        <>
          {groups?.length > 0 ? (
            <>
              {groups?.map((eachGroup) => (
                <ChatRoomProfile
                  items={eachGroup}
                  addUserIcon={false}
                  onClick={() => {
                    navigate(`/chat/group/${eachGroup?.ChatRoomID}`);
                  }}
                />
              ))}
            </>
          ) : (
            <p align="center">No group found...</p>
          )}
          <Button onClick={newGroup}>+ Add new group</Button>
        </>
      )}
    </div>
  );
};

const User = (props) => {
  const [user, setUser] = useState({});
  const general = useContext(General);
  const router = useRouter();
  const userid = router.query?.userid;
  const _userid = general.fromBase64(userid);
  const apiPrefix = general.domain;
  const config = general.config;
  const url = apiPrefix + `api`;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const getUser = async () => {
    setLoading(true);
    setError(false);

    const ip = await axios.get("https://geolocation-db.com/json/");

    const _url = `${url}/user/${_userid}`;
    const res = await axios.get(_url, general.config).catch((e) => {
      if (e.request) {
        setLoading(false);
        setError(true);
      }
    });
    const data = res?.data?.Data;
    if (data !== null) {
      data?.map((_user) => {
        setUser(_user);
        setLoading(false);
        setError(false);
      });
    } else {
      setLoading(false);
      setError(true);
    }
  };

  useEffect(() => {
    getUser();
    return () => {};
  }, [userid, general.refreshState]);
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
      ) : (
        <section className={css.user}>
          <div className={css.profile}>
            <Profile user={user} />
          </div>
          {user.UserID === props.userId && (
            <div className={css.setting}>
              <Settings user={user} />
            </div>
          )}
        </section>
      )}
    </>
  );
};

export default User;

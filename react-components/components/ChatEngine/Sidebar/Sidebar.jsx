import React, { useContext, useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import css from "./Sidebar.module.css";
import { Form, FormGroup } from "../../Form/Form";
import { General } from "../../../context/GeneralContext";
import dummy from "../../../assets/images/dummy-img.png";
import NoItem from "../../NoItem/NoItem";
import axios from "axios";
import { sendDiscussion } from "../Messages/Messages";

export const SidebarSearch = (props) => {
  const allClickHandler = () => {
    props?.onAllClick();
  };

  const activeClickHandler = () => {
    props?.onActiveClick();
  };

  const inActiveClickHandler = () => {
    props?.onInActiveClick();
  };

  const onChangeHandler = (e) => {
    props?.onChange(e);
  };

  return (
    <>
      <section className={css["sidebar-icon"]}>
        <div className={css["icon-group"]}>
          <Form>
            <FormGroup
              icon={props.icon}
              placeholder={props.placeholder}
              onChange={onChangeHandler}
            />
            {props.showIcon && (
              <div className={css["icon-container"]}>
                <i className={props.actionIcon}></i>
              </div>
            )}
          </Form>
        </div>
        {props.showOptions && (
          <div className={css.options}>
            <ul>
              {!props.all ? null : (
                <Link
                  className={({ isActive }) => (isActive ? css.active : "")}
                  href={props.onAllLink}
                  shallow={true}
                >
                  <li onClick={allClickHandler}>{props.all}</li>
                </Link>
              )}

              <Link
                href={props.onActiveLink}
                className={({ isActive }) => (isActive ? css.active : "")}
                shallow={true}
              >
                <li onClick={activeClickHandler}>{props.active}</li>
              </Link>
              <Link
                href={props.onInActiveLink}
                className={({ isActive }) => (isActive ? css.active : "")}
                shallow={true}
              >
                <li onClick={inActiveClickHandler}>{props.inActive}</li>
              </Link>
            </ul>
          </div>
        )}
      </section>
    </>
  );
};

export const ChatRoomMapComponents = (props) => {
  const allItems = [...props?.profiles];
  return (
    <section className={css["sidebar-map-components"]}>
      <h1>{props.title}</h1>
      <br />
      <div className={css["all-components"]}>
        {allItems.length > 0 ? (
          allItems?.map((eachItem, i) => {
            return (
              <>
                <ChatRoomProfile
                  onClick={props.onClick}
                  items={eachItem}
                  className={css.large}
                  addUserIcon={props.addUserIcon}
                  addMessagesCount={props.addMessagesCount}
                  chatroom={true}
                />
                <ChatRoomProfile
                  onClick={props.onMediumClick}
                  items={eachItem}
                  className={css.medium}
                  addUserIcon={props.addUserIcon}
                  addMessagesCount={props.addMessagesCount}
                  chatroom={true}
                />
              </>
            );
          })
        ) : (
          <div className={css["no-item"]}>
            <NoItem message="No contacts found" />
          </div>
        )}
      </div>
    </section>
  );
};

export const DisscussionMapComponents = (props) => {
  const allItems = [...props.profiles];
  return (
    <section className={css["sidebar-map-discussion-components"]}>
      <h1>{props.title}</h1>
      <br />
      <div className={css["all-components"]}>
        {allItems.length > 0 ? (
          allItems.map((eachItem, i) => {
            return (
              <>
                <Discussion
                  onClick={props.onClick}
                  items={eachItem}
                  addUserIcon={props.addUserIcon}
                  className={css.large}
                  addMessagesCount={props.addMessagesCount}
                />
                <Discussion
                  onClick={props.onMediumClick}
                  items={eachItem}
                  addUserIcon={props.addUserIcon}
                  className={css.medium}
                  addMessagesCount={props.addMessagesCount}
                />
              </>
            );
          })
        ) : (
          <div className={css["no-item"]}>
            <NoItem message="No new Messages found" />
          </div>
        )}
      </div>
    </section>
  );
};

export const NotificationMapComponents = (props) => {
  const allItems = [...props.profiles];
  return (
    <section className={css["sidebar-map-components"]}>
      <h1>{props.title}</h1>
      <br />
      <div className={css["all-components"]}>
        {allItems.length > 0 ? (
          allItems.map((eachItem, i) => {
            return (
              <>
                <Notification
                  onClick={props.onMediumClick}
                  items={eachItem}
                  addUserIcon={props.addUserIcon}
                  addMessagesCount={props.addMessagesCount}
                  className={`${eachItem?.Viewed ? null : css.unviewed} ${
                    css.notifications
                  }`}
                  setStates={props.setStates}
                  addDeleteIcon={props.addDeleteIcon}
                />
              </>
            );
          })
        ) : (
          <div className={css["no-item"]}>
            <NoItem message="No notifications found" />
          </div>
        )}
      </div>
    </section>
  );
};

export const UserMapComponents = (props) => {
  const allItems = [...props.profiles];
  return (
    <section className={css["sidebar-map-components"]}>
      <h1>{props.title}</h1>
      <br />
      <div className={css["all-user-components"]}>
        {allItems.length > 0 ? (
          allItems.map((eachItem, i) => {
            if (eachItem.Type === "Group") {
              return (
                <>
                  <GroupProfile
                    items={eachItem}
                    addUserIcon={props.addUserIcon}
                  />
                </>
              );
            } else {
              return (
                <>
                  <UserProfile
                    items={eachItem}
                    addUserIcon={props.addUserIcon}
                  />
                </>
              );
            }
          })
        ) : (
          <div className={css["no-item"]}>
            <NoItem message={props.notFoundMessage} />
          </div>
        )}
      </div>
    </section>
  );
};

export const RequestMapComponents = (props) => {
  const navigate = useRouter();
  const status = navigate.query?.query;
  const allItems = [...props.profiles];
  // useEffect(() => {
  //   console.log(status);
  // }, []);
  return (
    <section className={css["sidebar-map-components"]}>
      <h1>{props.title}</h1>
      <br />
      <div className={css["all-components"]}>
        {allItems.length > 0 ? (
          allItems.map((eachItem, i) => {
            return (
              <>
                {status === "sent" && (
                  <>
                    <SentRequest
                      onClick={props.onClick}
                      userId={props.userId}
                      items={eachItem}
                    />
                  </>
                )}
                {status === "recieved" && (
                  <>
                    <RecievedRequest
                      onClick={props.onClick}
                      userId={props.userId}
                      items={eachItem}
                    />
                  </>
                )}
                {status === undefined && (
                  <>
                    <SentRequest
                      onClick={props.onClick}
                      userId={props.userId}
                      items={eachItem}
                    />
                  </>
                )}
              </>
            );
          })
        ) : (
          <div className={css["no-item"]}>
            <NoItem message="No requests found" />
          </div>
        )}
      </div>
    </section>
  );
};

export const ChatRoomProfile = ({
  items,
  className,
  addUserIcon,
  onClick,
  chatroom,
}) => {
  const general = useContext(General);

  const onClickHandler = () => {
    onClick();
    if (chatroom) {
      const chatRoom = {
        ...items,
      };
      sessionStorage.setItem("chatRoom", JSON.stringify(chatRoom));
      console.log(chatRoom);
      general.setRefreshState((prev) => !prev);
    } else {
    }
  };

  return (
    <section
      className={`${css["sidebar-user"]} ${className}`}
      onClick={onClickHandler}
    >
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
        <p className={css["name"]}>{items?.ChatRoomName}</p>
        <p className={css["about"]}>
          {items?.Description?.length > 50
            ? items?.Description.slice(0, 50) + "..."
            : items?.Description}
        </p>
      </div>
      {addUserIcon && (
        <div className={css["user-icon"]}>
          <i className="fas fa-user"></i>
        </div>
      )}
    </section>
  );
};

export const Discussion = ({ items, className, addMessagesCount, onClick }) => {
  const general = useContext(General);

  const deleteDiscussion = async () => {
    const response = await axios
      .delete(
        `${general.domain}api/discussion/${general.toBase64(
          items?.ChatRoomID
        )}`,
        general.config
      )
      .catch();
    if (response) {
      console.log("Discusion deleted successfully");
    }
  };

  const onClickHandler = () => {
    onClick();
    const chatRoom = {
      ChatRoomID: items?.ChatRoomID,
      ChatRoomName: items?.ChatRoomName,
      Chats: null,
      Description: null,
      IsOnline: items?.IsOnline,
      LastSeen: items?.LastSeen,
      ProfilePicture: items?.ProfilePicture,
      Type: items?.Type,
    };

    sessionStorage.setItem("chatRoom", JSON.stringify(chatRoom));
    console.log(chatRoom);

    deleteDiscussion();
    sendDiscussion();

    general.setRefreshState((prev) => !prev);
  };

  return (
    <section
      className={`${css["sidebar-discussion"]} ${className}`}
      onClick={onClickHandler}
    >
      <div className={css["img-container"]}>
        <img
          src={
            items?.ProfilePicture === null || items?.ProfilePicture === ""
              ? dummy
              : items?.ProfilePicture
          }
          alt=""
        />
      </div>
      <div className={css["details"]}>
        <p className={css["name"]}>{items?.ChatRoomName}</p>
        <p className={css["about"]}>
          {items?.LastMessage?.length > 50
            ? items?.LastMessage.slice(0, 50) + "..."
            : items?.LastMessage}
        </p>
      </div>
      {addMessagesCount && (
        <div className={css["message-count"]}>{items?.Count}</div>
      )}
    </section>
  );
};

export const Notification = ({
  items,
  className,
  addDeleteIcon,
  setStates,
}) => {
  const navigate = useRouter();
  const general = useContext(General);
  const onClickHandler = async () => {
    // console.log(items);
    if (items?.Target === "users") {
      navigate(
        `/chat/user/${general.toBase64(
          items?.IdentityToRender.IdentityToRenderID
        )}`
      );
    } else if (items?.Target === "requests") {
      navigate(`/chat/requests/`);
    }

    const response = await axios
      .put(`${general.domain}api/notification/${items?.ID}`, general.config)
      .catch();
  };
  const onDeleteClickHandler = async () => {
    const response = await axios
      .delete(`${general.domain}api/notification/${items?.ID}`, general.config)
      .catch((e) => {
        console.log(e);
      });
    if (response) {
      general.refreshAll(`${general.domain}api/notification`, general.config, [
        ...setStates,
      ]);
    }
  };
  return (
    <section
      className={`${css["sidebar-notification"]} ${className}`}
      onClick={onClickHandler}
    >
      <div className={css["img-container"]}>
        <img
          src={
            items?.IdentityToRender?.IdentityToRenderProfilePicture === null ||
            items?.IdentityToRender?.IdentityToRenderProfilePicture === ""
              ? dummy
              : items?.IdentityToRender?.IdentityToRenderProfilePicture
          }
          alt=""
        />
      </div>
      <div className={css["details"]}>
        <p className={css["name"]}>
          {items?.IdentityToRender?.IdentityToRenderName}
        </p>
        <p className={css["about"]}>
          {items?.Message?.length > 50
            ? items?.Message.slice(0, 50) + "..."
            : items?.Message}
        </p>
      </div>
      {addDeleteIcon && (
        <div className={css["icon-container"]}>
          <div className={css["delete-icon"]} onClick={onDeleteClickHandler}>
            <i className="fa-solid fa-trash"></i>
          </div>
        </div>
      )}
    </section>
  );
};

export const UserProfile = ({ items, className, addUserIcon, onClick }) => {
  const general = useContext(General);
  const navigate = useRouter();

  const onClickHandler = () => {
    navigate(`/chat/user/${general.toBase64(items.UserID)}`);
  };

  return (
    <section
      className={`${css["sidebar-user-profile"]} ${className}`}
      onClick={onClickHandler}
    >
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
      {addUserIcon && (
        <div className={css["user-icon"]}>
          <i className="fas fa-user-plus"></i>
        </div>
      )}
    </section>
  );
};

export const GroupProfile = ({ items, className, addUserIcon }) => {
  const general = useContext(General);
  const navigate = useRouter();

  const onClickHandler = () => {
    navigate(`/chat/group/${items?.ChatRoomID}`);
  };

  return (
    <section
      className={`${css["sidebar-user-profile"]} ${className}`}
      onClick={onClickHandler}
    >
      <div className={css["img-container"]}>
        <img
          src={
            items?.ProfilePicture === null || items?.ProfilePicture === ""
              ? dummy
              : items?.ProfilePicture
          }
          alt=""
        />
        <div className={`${css.status} ${css.online}`}></div>
      </div>
      <div className={css["details"]}>
        <p className={css["name"]}>{items?.ChatRoomName}</p>
      </div>
      {addUserIcon && (
        <div className={css["user-icon"]}>
          <i className="fas fa-user-plus"></i>
        </div>
      )}
    </section>
  );
};

export const SentRequest = ({ items, className, userId }) => {
  const general = useContext(General);
  const navigate = useRouter();
  const url = `${general.domain}api/requests`;

  const onDeleteClickHandler = async () => {
    axios
      .delete(`${url}/${userId}/${items?.ID}`, general.config)
      .then((response) => {
        // console.log("Delete request", response.data);
        general.setRefreshState((prev) => !prev);
      })
      .catch((e) => {});
  };

  useEffect(() => {
    // console.log("SentRequest Item ", items);
  }, []);
  return (
    <section className={`${css["sidebar-sent-request"]} ${className}`}>
      <div className={css["img-container"]}>
        <img
          src={
            items?.To?.ProfilePicture === null ||
            items?.To?.ProfilePicture === ""
              ? dummy
              : items?.To?.ProfilePicture
          }
          alt=""
        />
        <div
          className={`${css.status} ${
            items?.To.IsOnline ? css.online : css.offline
          }`}
        ></div>
      </div>
      <div className={css["details"]}>
        <p className={css["name"]}>{items?.To?.UserName}</p>
        <p className={css["about"]}>
          {items?.Message?.length > 50
            ? items?.Message?.slice(0, 50) + "..."
            : items?.Message}
        </p>
      </div>
      <div className={css["icon-container"]}>
        <div className={css["delete-icon"]} onClick={onDeleteClickHandler}>
          <i className="fa-solid fa-trash"></i>
        </div>
      </div>
    </section>
  );
};

export const RecievedRequest = ({ items, className, userId }) => {
  const general = useContext(General);
  const navigate = useRouter();
  const url = `${general.domain}api/requests`;
  const [disabled, setDisabled] = useState(false);

  const onDeleteClickHandler = async () => {
    const response = await axios
      .delete(`${url}/${userId}/${items?.ID}`, general.config)

      .catch((e) => {});

    if (response) {
      // console.log("Delete request", response.data);
      if (items?.From_Type === "User" && items?.To_Type === "User") {
        const body = [
          {
            ID: 0,
            UserID: items?.To?.UserID,
            IdentityToRender: {
              IdentityToRenderID: items?.From?.UserID,
              IdentityToRenderName: null,
              IdentityToRenderProfilePicture: null,
              IsOnline: false,
            },
            Message: `You declined a request sent by to ${items?.From?.UserName}`,
            Type: "User",
            Target: "requests",
            Viewed: false,
          },
          {
            ID: 0,
            UserID: items?.From?.UserID,
            IdentityToRender: {
              IdentityToRenderID: items?.To?.UserID,
              IdentityToRenderName: null,
              IdentityToRenderProfilePicture: null,
              IsOnline: false,
            },
            Message: `${items?.To?.UserName} declined your request`,
            Type: "User",
            Target: "requests",
            Viewed: false,
          },
        ];
        general.postNotification(body);
      }
      if (items?.From_Type === "User" && items?.To_Type === "Group") {
        const body = [
          {
            ID: 0,
            UserID: items?.To?.UserID,
            IdentityToRender: {
              IdentityToRenderID: items?.From?.UserID,
              IdentityToRenderName: null,
              IdentityToRenderProfilePicture: null,
              IsOnline: false,
            },
            Message: `You declined a request sent by ${items?.From?.UserName}`,
            Type: "User",
            Target: "requests",
            Viewed: false,
          },
          {
            ID: 0,
            UserID: items?.From?.UserID,
            IdentityToRender: {
              IdentityToRenderID: items?.To?.UserID,
              IdentityToRenderName: null,
              IdentityToRenderProfilePicture: null,
              IsOnline: false,
            },
            Message: `${items?.To?.UserName} declined your request`,
            Type: "Group",
            Target: "requests",
            Viewed: false,
          },
        ];
        general.postNotification(body);
      }

      if (items?.From_Type === "Group" && items?.To_Type === "User") {
        const body = [
          {
            ID: 0,
            UserID: items?.To?.UserID,
            IdentityToRender: {
              IdentityToRenderID: items?.From?.UserID,
              IdentityToRenderName: null,
              IdentityToRenderProfilePicture: null,
              IsOnline: false,
            },
            Message: `You declined a request sent by ${items?.From?.UserName}`,
            Type: "Group",
            Target: "requests",
            Viewed: false,
          },
          {
            ID: 0,
            UserID: items?.From?.UserID,
            IdentityToRender: {
              IdentityToRenderID: items?.To?.UserID,
              IdentityToRenderName: null,
              IdentityToRenderProfilePicture: null,
              IsOnline: false,
            },
            Message: `${items?.To?.UserName} declined your invitation`,
            Type: "User",
            Target: "requests",
            Viewed: false,
          },
        ];
        general.postNotification(body);
      }

      general.setRefreshState((prev) => !prev);
    }
  };

  const onAcceptHandler = async () => {
    setDisabled(true);

    const response = await axios
      .post(`${url}/accept/${userId}/${items?.ID}`, {}, general.config)
      .catch((e) => {
        setDisabled(false);
      });

    if (response) {
      console.log("Accept request", response.data);
      setDisabled(false);

      if (items?.From_Type === "User" && items?.To_Type === "User") {
        const body = [
          {
            ID: 0,
            UserID: items?.To?.UserID,
            IdentityToRender: {
              IdentityToRenderID: items?.From?.UserID,
              IdentityToRenderName: null,
              IdentityToRenderProfilePicture: null,
              IsOnline: false,
            },
            Message: `You accepted ${items?.From?.UserName} request `,
            Type: "User",
            Target: "requests",
            Viewed: false,
          },
          {
            ID: 0,
            UserID: items?.From?.UserID,
            IdentityToRender: {
              IdentityToRenderID: items?.To?.UserID,
              IdentityToRenderName: null,
              IdentityToRenderProfilePicture: null,
              IsOnline: false,
            },
            Message: `${items?.To?.UserName} accepted your request`,
            Type: "User",
            Target: "requests",
            Viewed: false,
          },
        ];
        general.postNotification(body);
      }
      if (items?.From_Type === "User" && items?.To_Type === "Group") {
        const body = [
          {
            ID: 0,
            UserID: items?.To?.UserID,
            IdentityToRender: {
              IdentityToRenderID: items?.From?.UserID,
              IdentityToRenderName: null,
              IdentityToRenderProfilePicture: null,
              IsOnline: false,
            },
            Message: `You accepted ${items?.From?.UserName} request`,
            Type: "User",
            Target: "requests",
            Viewed: false,
          },
          {
            ID: 0,
            UserID: items?.From?.UserID,
            IdentityToRender: {
              IdentityToRenderID: items?.To?.UserID,
              IdentityToRenderName: null,
              IdentityToRenderProfilePicture: null,
              IsOnline: false,
            },
            Message: `${items?.To?.UserName} accepted your request`,
            Type: "Group",
            Target: "requests",
            Viewed: false,
          },
        ];
        general.postNotification(body);
      }
      if (items?.From_Type === "Group" && items?.To_Type === "User") {
        const body = [
          {
            ID: 0,
            UserID: items?.To?.UserID,
            IdentityToRender: {
              IdentityToRenderID: items?.From?.UserID,
              IdentityToRenderName: null,
              IdentityToRenderProfilePicture: null,
              IsOnline: false,
            },
            Message: `You accepted ${items?.From?.UserName} invitation`,
            Type: "Group",
            Target: "requests",
            Viewed: false,
          },
          {
            ID: 0,
            UserID: items?.From?.UserID,
            IdentityToRender: {
              IdentityToRenderID: items?.To?.UserID,
              IdentityToRenderName: null,
              IdentityToRenderProfilePicture: null,
              IsOnline: false,
            },
            Message: `${items?.To?.UserName} accepted your invitation`,
            Type: "User",
            Target: "requests",
            Viewed: false,
          },
        ];
        general.postNotification(body);
      }

      general.setRefreshState((prev) => !prev);
    }
  };

  useEffect(() => {
    // console.log("RecievedRequest Item ", items);
  }, []);

  return (
    <section className={`${css["sidebar-recieved-request"]} ${className}`}>
      <div className={css["img-container"]}>
        <img
          src={
            items?.From?.ProfilePicture === null ||
            items?.From?.ProfilePicture === ""
              ? dummy
              : items?.From?.ProfilePicture
          }
          alt=""
        />
        <div
          className={`${css.status} ${
            items?.From?.IsOnline ? css.online : css.offline
          }`}
        ></div>
      </div>
      <div className={css["details"]}>
        <p className={css["name"]}>{items?.From?.UserName}</p>
        <p className={css["about"]}>
          {items?.Message?.length > 50
            ? items?.Message?.slice(0, 50) + "..."
            : items?.Message}
        </p>
      </div>
      <div className={css["icon-container"]}>
        <button disabled={disabled}>
          <div className={css["accept-icon"]} onClick={onAcceptHandler}>
            <i className="fa-solid fa-check"></i>
          </div>
        </button>

        <div className={css["decline-icon"]} onClick={onDeleteClickHandler}>
          <i className="fa-solid fa-ban"></i>
        </div>
      </div>
    </section>
  );
};

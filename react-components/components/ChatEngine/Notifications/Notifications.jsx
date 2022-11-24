import React, { useContext, useEffect, useState } from "react";
import { SidebarSearch, NotificationMapComponents } from "../Sidebar/Sidebar";
import css from "./Notifications.module.css";
import { messages as allNotifications } from "../../../dummyData";
import { useRouter, useParams } from "next/router";
import axios from "axios";
import { General } from "../../../context/GeneralContext";
import Loader from "../../Loader/Loader";
import ServerError from "../../ServerError/ServerError";
import { io } from "socket.io-client";
import { socketDomain } from "../../ExternalFunctions";
import { Calls } from "../../../../ExternalFunctions";

export const PostNotification = async (body) => {
  const general = useContext(General);

  const url = `${general.domain}api/notification`;
  const config = { ...general.config };

  const response = await axios.post(url, body, config).catch();

  console.log(response?.data);
  console.log("Notification sent successfully");
};

export const notificationSocket = io.connect(`${socketDomain}/notification`);

export const notify = (userid) => {
  notificationSocket.emit("notify", userid);
};

const Notifications = (props) => {
  const navigate = useRouter();
  const userId = props.userId;
  const status = navigate.query?.query;
  const [notifications, setNotifications] = useState([]);
  const [allNotifications, setAllNotifications] = useState([]);
  const general = useContext(General);
  const apiPrefix = general.domain;
  const config = general.config;
  const url = apiPrefix + `api/notification`;
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  let fetching = false;

  const getNotifications = () => {
    if (status === "all") {
      selectAll();
    } else if (status === "read") {
      selectRead();
    } else if (status === "unread") {
      selectUnread();
    } else {
      selectAll();
    }
  };

  const selectAll = async () => {
    // setNotifications(allNotifications);
    setLoading(true);
    setError(false);

    const response = await axios.get(url, general.config).catch((e) => {
      setLoading(false);
      setError(true);
    });

    if (response) {
      const _notifications = response?.data?.Data;

      if (_notifications?.length > 0) {
        setNotifications(_notifications);
        setAllNotifications(_notifications);
      } else {
        setAllNotifications([]);
        setNotifications([]);
      }

      setLoading(false);
      setError(false);
    }
  };

  const selectRead = () => {
    setNotifications(
      allNotifications.filter((notification) => notification?.Viewed === true)
    );
  };

  const selectUnread = () => {
    setNotifications(
      allNotifications.filter((notification) => notification?.Viewed === false)
    );
  };

  const onSearchChangeHandler = (e) => {
    const currentValue = e?.target?.value;

    if (e?.target?.value === null || e?.target?.value === "") {
      if (status === "all") {
        selectAll();
      } else if (status === "read") {
        selectRead();
      } else if (status === "unread") {
        selectUnread();
      } else {
        selectAll();
      }
    } else {
      if (status === "all") {
        setNotifications(
          allNotifications.filter((eachNotification) =>
            eachNotification.IdentityToRender?.IdentityToRenderName?.toLowerCase()?.includes(
              currentValue?.toLowerCase()
            )
          )
        );
      } else if (status === "read") {
        const readNotifications = allNotifications.filter(
          (notification) => notification?.Viewed === true
        );

        setNotifications(
          readNotifications.filter((notification) =>
            notification.IdentityToRender?.IdentityToRenderName?.toLowerCase()?.includes(
              currentValue?.toLowerCase()
            )
          )
        );
      } else if (status === "unread") {
        const unReadNotifications = allNotifications.filter(
          (notification) => notification?.Viewed === false
        );

        setNotifications(
          unReadNotifications.filter((notification) =>
            notification.IdentityToRender?.IdentityToRenderName?.toLowerCase()?.includes(
              currentValue?.toLowerCase()
            )
          )
        );
      } else {
        setNotifications(
          allNotifications.filter((eachNotification) =>
            eachNotification.IdentityToRender?.IdentityToRenderName?.toLowerCase()?.includes(
              currentValue?.toLowerCase()
            )
          )
        );
      }

      // console.log(e?.target?.value);
    }
  };

  const refreshNotifications = async () => {
    if (!fetching) {
      fetching = true;
      const response = await axios.get(url).catch((e) => {
        fetching = false;
      });
      if (
        Array.isArray(response?.data?.Data) &&
        response?.data?.Data?.length > 0
      ) {
        const newNotifications = [...response?.data?.Data];
        console.log("Data recieved", newNotifications);

        setAllNotifications(newNotifications);
        setNotifications(newNotifications);

        setTimeout(() => {
          fetching = false;
        }, 15000);
      }
    }
  };

  useEffect(() => {
    getNotifications();
    notificationSocket.emit("join", userId);
  }, []);

  useEffect(() => {
    notificationSocket.on("connection", (message) => {
      console.log(message);
      notificationSocket.emit("join", userId);
    });
    notificationSocket.on("notification", () => {
      console.log("User recieved a notification");

      refreshNotifications();
    });
  }, [notificationSocket]);

  return (
    <div className={css.messages}>
      <div className={css.search}>
        <SidebarSearch
          icon="fa fa-search"
          actionIcon="fa-solid fa-user-plus"
          placeholder="Search all notifications"
          all="All"
          active="Read"
          inActive="Unread"
          onAllClick={selectAll}
          onActiveClick={selectRead}
          onInActiveClick={selectUnread}
          onAllLink="/?tab=notifications&query=all"
          onActiveLink="/?tab=notifications&query=read"
          onInActiveLink="/?tab=notifications&query=unread"
          showOptions={true}
          onChange={onSearchChangeHandler}
        />
      </div>
      <div className={css.users}>
        {loading ? (
          <>
            <Loader />
          </>
        ) : error ? (
          <>
            <ServerError />
          </>
        ) : (
          <NotificationMapComponents
            title="Notifications"
            addUserIcon={false}
            profiles={notifications}
            addMessagesCount={false}
            setStates={[setNotifications, setAllNotifications]}
            addDeleteIcon={true}
          />
        )}
      </div>
    </div>
  );
};

export default Notifications;

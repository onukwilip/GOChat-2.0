import React, { useEffect, useState, useContext } from "react";
import css from "./ChatEngine.module.css";
import ChatBlock from "../../components/ChatEngine/ChatBlock/ChatBlock";
import Navbar from "../../components/ChatEngine/Navbar/Navbar";
import { useRouter } from "next/router";
import Contacts from "../../components/ChatEngine/Contacts/Contacts";
import Messages from "../../components/ChatEngine/Messages/Messages";
import Notifications from "../../components/ChatEngine/Notifications/Notifications";
import Glassmorphism from "../../components/Glassmorphism/Glassmorphism";
import { General } from "../../context/GeneralContext";
import axios from "axios";
import AllContacts from "../../components/ChatEngine/AllContacts/AllContacts";
import User from "../../components/ChatEngine/User/User";
import { Request } from "../../components/ChatEngine/Sidebar/Sidebar";
import Requests from "../../components/ChatEngine/Requests/Requests";
import Group from "../../components/ChatEngine/Groups/Groups";
// import io from "socket.io-client";

// export let socket;

// const socketInitializer = async () => {
//   await fetch("./api/socket");
//   socket = io();

//   socket.on("connection", () => {
//     console.log("connected");
//   });
// };

// socketInitializer();

const ChatEngine = (props) => {
  const [mobileMenu, setMobileMenu] = useState(false);
  const [user, setUser] = useState("");
  const [width, setWidth] = useState(0);
  const general = useContext(General);
  const userId = props.userId;
  const apiPrefix = general.domain;
  const config = general.config;
  const url = apiPrefix + `api`;
  const router = useRouter();
  const [path, setPath] = useState(router.query?.tab);

  const getUser = () => {
    const _url = `${url}/user`;
    axios
      .get(_url, config)
      .then((res) => {
        setUser(res.data);
        console.log("Chat engine", res.data);
      })
      .catch();
  };

  const routes = [
    {
      slug: "contacts",
      component: <Contacts userId={props.userId} />,
    },
    {
      slug: "messages",
      component: <Messages userId={props.userId} />,
    },
    {
      slug: "notifications",
      component: <Notifications userId={props.userId} />,
    },
    {
      slug: "all-contacts",
      component: <AllContacts userId={props.userId} />,
    },
    {
      slug: "user",
      component: <User userId={props.userId} />,
    },
    {
      slug: "platform",
      component:
        width < 1150 ? (
          <ChatBlock
            image={user.ProfilePicture}
            userName={user.UserName}
            userId={props.userId}
          />
        ) : (
          <Contacts userId={props.userId} />
        ),
    },
    {
      slug: "requests",
      component: <Requests userId={props.userId} />,
    },
    {
      slug: "group",
      component: <Group userId={props.userId} />,
    },
  ];

  const getComponent = (path, showChatBlock) => {
    if (Array.isArray(routes)) {
      const componentToRender = routes.filter((route) => route.slug === path);

      if (componentToRender?.length > 0 && showChatBlock) {
        return componentToRender[0]?.component;
      } else if (componentToRender?.length > 0 && !showChatBlock) {
        if (componentToRender.slug !== "platform") {
          return componentToRender[0]?.component;
        } else {
          return routes[0]?.component;
        }
      } else {
        return routes[0]?.component;
      }
    } else {
      return null;
    }
  };

  useEffect(() => {
    getUser();
    setWidth(window.innerWidth);
    return () => {};
  }, [general.refreshState]);

  useEffect(() => {
    setPath(router.query?.tab);
  }, [router.query?.tab]);

  return (
    <>
      <div
        className={css.hamburger}
        onClick={() => {
          setMobileMenu((prev) => !prev);
        }}
      >
        <i className={!mobileMenu ? "fas fa-bars" : "fas fa-times"}></i>
      </div>
      {mobileMenu && (
        <Glassmorphism className={css["mobile-menu"]}>
          <Navbar image={user.ProfilePicture} userId={user.UserID} />
        </Glassmorphism>
      )}

      <section className={css["chat-engine"]}>
        <div className={css.navbar}>
          <Navbar image={user.ProfilePicture} userId={user.UserID} />
        </div>
        <div className={css.body}>
          <div className={css["body-container"]}>
            <div className={css.sidebar}>
              <div className={css["sidebar-children"]}>
                {getComponent(path, false)}
              </div>
            </div>
            <div className={css["chat-block"]}>
              <ChatBlock
                image={user.ProfilePicture}
                userName={user.UserName}
                userId={props.userId}
              />
            </div>
          </div>
          <div className={css["mobile-body"]}>{getComponent(path, true)}</div>
        </div>
      </section>
    </>
  );
};

export default ChatEngine;

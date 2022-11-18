import React, { useContext, useEffect, useState } from "react";
import { SidebarSearch, ChatRoomMapComponents } from "../Sidebar/Sidebar";
import css from "./Contacts.module.css";
import { chatRooms as allChatrooms } from "../../../dummyData";
import { useRouter } from "next/router";
import axios from "axios";
import { General } from "../../../context/GeneralContext";
import Loader from "../../Loader/Loader";
import ServerError from "../../ServerError/ServerError";

const Contacts = (props) => {
  const navigate = useRouter();
  // const [userId, setUserId] = useState();
  const userId = props.userId;
  const [status, setStatus] = useState(navigate.query?.tab);
  const [contacts, setContacts] = useState([]);
  const [allContacts, setAllContacts] = useState([]);
  const [loading, setLoading] = useState(false);
  const general = useContext(General);
  const apiPrefix = general.domain;
  const config = general.config;
  const url = apiPrefix + `api/chatroom`;
  const [error, setError] = useState(false);

  const getChatRooms = () => {
    if (status === "all") {
      selectAll();
    } else if (status === "online") {
      selectOnline();
    } else if (status === "offline") {
      selectOffline();
    } else {
      selectAll();
    }
  };

  const selectAll = async () => {
    setLoading(true);
    setError(false);

    const response = await axios
      .get(`${url}`, {
        ...general.config,
      })
      .catch((e) => {
        if (e.request) {
          setLoading(false);
          setError(true);
        } else {
          setLoading(false);
          setError(true);
        }
      });

    if (response) {
      const chatRooms = response?.data?.Data;

      if (chatRooms?.length > 0) {
        setContacts(chatRooms);
        setAllContacts(chatRooms);
      } else {
        setContacts([]);
        setAllContacts([]);
      }

      setLoading(false);
      setError(false);

      // console.log("All Chatrooms Response", response.data);
      // console.log("All Chatrooms", response?.data?.Data);
    }
  };

  const selectOffline = () => {
    setContacts(allContacts.filter((contact) => contact.IsOnline === false));
  };

  const selectOnline = () => {
    setContacts(allContacts.filter((contact) => contact.IsOnline === true));
  };

  const onclick = () => {
    console.log("Desktop click");
  };

  const onMediumclick = () => {
    navigate.push("/?tab=platform");
  };

  const onSearchChangeHandler = (e) => {
    const currentValue = e?.target?.value;

    if (e?.target?.value === null || e?.target?.value === "") {
      if (status === "all") {
        setContacts(allContacts);
      } else if (status === "online") {
        selectOnline();
      } else if (status === "offline") {
        selectOffline();
      } else {
        setContacts(allContacts);
      }
    } else {
      if (status === "all") {
        setContacts(
          allContacts.filter((eachContact) =>
            eachContact.ChatRoomName?.toLowerCase()?.includes(
              currentValue?.toLowerCase()
            )
          )
        );
      } else if (status === "online") {
        const onlineContacts = allContacts.filter(
          (contact) => contact.IsOnline === true
        );

        setContacts(
          onlineContacts.filter((eachContact) =>
            eachContact.ChatRoomName?.toLowerCase()?.includes(
              currentValue?.toLowerCase()
            )
          )
        );
      } else if (status === "offline") {
        const offlineContacts = allContacts.filter(
          (contact) => contact.IsOnline === false
        );

        setContacts(
          offlineContacts.filter((eachContact) =>
            eachContact.ChatRoomName?.toLowerCase()?.includes(
              currentValue?.toLowerCase()
            )
          )
        );
      } else {
        setContacts(
          allContacts.filter((eachContact) =>
            eachContact.ChatRoomName?.toLowerCase()?.includes(
              currentValue?.toLowerCase()
            )
          )
        );
      }

      // console.log(e?.target?.value);
    }
  };

  useEffect(() => {
    getChatRooms();
  }, [status]);

  useEffect(() => {
    // setUserId(localStorage.getItem("UserId"));
  }, []);

  useEffect(() => {
    setStatus(navigate.query?.tab);
  }, [navigate.query?.tab]);

  return (
    <div className={css.contacts}>
      <div className={css.search}>
        <SidebarSearch
          icon="fa fa-search"
          actionIcon="fa-solid fa-user-plus"
          placeholder="Search for people"
          all="All"
          active="Online"
          inActive="Offline"
          onAllClick={selectAll}
          onActiveClick={selectOnline}
          onInActiveClick={selectOffline}
          onAllLink="/?tab=contacts&query=all"
          onActiveLink="/?tab=contacts&query=online"
          onInActiveLink="/?tab=contacts&query=offline"
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
          <ChatRoomMapComponents
            title="Contacts"
            addUserIcon={true}
            profiles={contacts}
            addMessagesCount={false}
            onClick={onclick}
            onMediumClick={onMediumclick}
          />
        )}
      </div>
    </div>
  );
};

export default Contacts;

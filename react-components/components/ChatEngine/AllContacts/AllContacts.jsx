import React, { useContext, useEffect, useState } from "react";
import { SidebarSearch, UserMapComponents } from "../Sidebar/Sidebar";
import css from "./AllContacts.module.css";
import { users as allContacts, users } from "../../../dummyData";
import { useRouter, useParams } from "next/router";
import axios from "axios";
import { General } from "../../../context/GeneralContext";
import Loader from "../../Loader/Loader";
import ServerError from "../../ServerError/ServerError";

const AllContacts = (props) => {
  const navigate = useRouter();
  const status = navigate.query?.query;
  const [contacts, setContacts] = useState([]);
  const [allContacts, setAllContacts] = useState([]);
  const userId = props.userId;
  const general = useContext(General);
  const apiPrefix = general.domain;
  const config = general.config;
  const userUrl = apiPrefix + `api/user/all`;
  const chatroomUrl = apiPrefix + `api/chatroom/`;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const getAllUsers = async () => {
    setLoading(true);
    setError(false);

    if (status === "fellas") {
      axios
        .get(`${userUrl}`, {
          ...general.config,
        })
        .then((response) => {
          console.log(response.data);
          const users = response.data.Data;
          setContacts([...users]);
          setAllContacts([...users]);
          setLoading(false);
          setError(false);
        })
        .catch((e) => {
          if (e.request) {
            setLoading(false);
            setError(true);
          } else {
            setLoading(false);
            setError(false);
          }
        });
    } else if (status === "groups") {
      axios
        .get(`${chatroomUrl}group`, general.config)
        .then((response) => {
          console.log(response.data);
          const users = response.data.Data;
          if (users !== null) {
            setContacts([...users]);
            setAllContacts([...users]);
          } else {
            setContacts([]);
            setAllContacts([]);
          }
          setLoading(false);
          setError(false);
        })
        .catch((e) => {
          if (e.request) {
            setLoading(false);
            setError(true);
          } else {
            setLoading(false);
            setError(false);
          }
        });
    } else {
      axios
        .get(`${userUrl}`, general.config)
        .then((response) => {
          console.log(response.data);
          const users = response.data.Data;
          setContacts([...users]);
          setAllContacts([...users]);
          setLoading(false);
          setError(false);
        })
        .catch((e) => {
          if (e.request) {
            setLoading(false);
            setError(true);
          } else {
            setLoading(false);
            setError(false);
          }
        });
    }
  };

  const selectFellas = async () => {};
  const selectGroups = async () => {};

  const onSearchChangeHandler = (e) => {
    const currentValue = e?.target?.value;

    if (e?.target?.value === null || e?.target?.value === "") {
      setContacts(allContacts);
    } else {
      if (status === "all") {
        setContacts(allContacts);
      } else if (status === "fellas") {
        setContacts(
          allContacts.filter((eachContact) =>
            eachContact?.UserName?.toLowerCase()?.includes(
              currentValue?.toLowerCase()
            )
          )
        );
      } else if (status === "groups") {
        setContacts(
          allContacts.filter((eachContact) =>
            eachContact?.ChatRoomName?.toLowerCase()?.includes(
              currentValue?.toLowerCase()
            )
          )
        );
      } else {
        setContacts(
          allContacts.filter((eachContact) =>
            eachContact?.UserName?.toLowerCase()?.includes(
              currentValue?.toLowerCase()
            )
          )
        );
      }
    }
  };

  useEffect(() => {
    getAllUsers();
  }, [general.refreshState, status]);

  return (
    <div className={css["all-contacts"]}>
      <div className={css.search}>
        <SidebarSearch
          icon="fa fa-search"
          actionIcon="fa-solid fa-user-plus"
          placeholder="Search for people"
          all={false}
          active="Fellas"
          inActive="Groups"
          onActiveClick={selectFellas}
          onInActiveClick={selectGroups}
          onAllLink="/?tab=all-contacts&query=all"
          onActiveLink="/?tab=all-contacts&query=fellas"
          onInActiveLink="/?tab=all-contacts&query=groups"
          showOptions={true}
          onChange={onSearchChangeHandler}
        />
      </div>
      <div className={css.users}>
        {loading ? (
          <Loader />
        ) : error ? (
          <>
            <ServerError />
          </>
        ) : (
          <>
            <UserMapComponents
              title="All Contacts"
              addUserIcon={true}
              profiles={contacts}
              addMessagesCount={false}
              notFoundMessage="No group was found..."
            />
          </>
        )}
      </div>
    </div>
  );
};

export default AllContacts;

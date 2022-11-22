import React, { useContext, useEffect, useState } from "react";
import css from "./Requests.module.css";
import { SidebarSearch, RequestMapComponents } from "../Sidebar/Sidebar";
import { users as allContacts, users } from "../../../dummyData";
import { useRouter, useParams } from "next/router";
import axios from "axios";
import { General } from "../../../context/GeneralContext";
import Loader from "../../Loader/Loader";
import ServerError from "../../ServerError/ServerError";

const Requests = (props) => {
  const navigate = useRouter();
  const status = navigate.query?.query;
  const [requests, setRequests] = useState([]);
  const [allRequests, setAllRequests] = useState([]);
  const userId = props.userId;
  const general = useContext(General);
  const apiPrefix = general.domain;
  const config = general.config;
  const baseUrl = apiPrefix + `api/requests/`;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const getAllRequests = async () => {
    setLoading(true);
    setError(false);

    if (status === "sent") {
      axios
        .get(`${baseUrl}/sent`, general.config)
        .then((response) => {
          console.log(response.data);
          const requests = response.data.Data;
          if (requests !== null) {
            setRequests([...requests]);
            setAllRequests([...requests]);
          } else {
            setRequests([]);
            setAllRequests([]);
          }
          setLoading(false);
          setError(false);
          console.log("Sent Requests ", response.data.Data);
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
    } else if (status === "recieved") {
      axios
        .get(`${baseUrl}/recieved/`, general.config)
        .then((response) => {
          console.log(response.data);
          const requests = response.data.Data;
          if (requests !== null) {
            setRequests([...requests]);
            setAllRequests([...requests]);
          } else {
            setRequests([]);
            setAllRequests([]);
          }
          setLoading(false);
          setError(false);
          console.log("Recieved Requests ", response.data.Data);
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
        .get(`${baseUrl}/sent/`, general.config)
        .then((response) => {
          console.log(response.data);
          const requests = response.data.Data;
          if (requests !== null) {
            setRequests([...requests]);
            setAllRequests([...requests]);
          } else {
            setRequests([]);
            setAllRequests([]);
          }
          setLoading(false);
          setError(false);
          console.log("Sent Requests ", response.data.Data);
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

  const sent = async () => {
    axios
      .get(`${baseUrl}/sent`, general.config)
      .then((response) => {
        console.log(response.data);
        const requests = response.data.Data;
        if (requests !== null) {
          setRequests([...requests]);
          setAllRequests([...requests]);
        } else {
          setRequests([]);
          setAllRequests([]);
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
  };
  const recieved = async () => {
    axios
      .get(`${baseUrl}/recieved`, general.config)
      .then((response) => {
        console.log(response.data);
        const requests = response.data.Data;
        if (requests !== null) {
          setRequests([...requests]);
          setAllRequests([...requests]);
        } else {
          setRequests([]);
          setAllRequests([]);
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
  };
  const onSearchChangeHandler = (e) => {
    const currentValue = e?.target?.value;

    if (e?.target?.value === null || e?.target?.value === "") {
      setRequests(allRequests);
    } else {
      if (status === "sent") {
        setRequests(
          allRequests.filter((eachContact) =>
            eachContact?.To?.UserName?.toLowerCase()?.includes(
              currentValue?.toLowerCase()
            )
          )
        );
      } else if (status === "recieved") {
        setRequests(
          allRequests.filter((eachContact) =>
            eachContact?.From?.UserName?.toLowerCase()?.includes(
              currentValue?.toLowerCase()
            )
          )
        );
      } else {
        setRequests(
          allRequests.filter((eachContact) =>
            eachContact?.ChatRoomName?.toLowerCase()?.includes(
              currentValue?.toLowerCase()
            )
          )
        );
      }
    }
  };

  useEffect(() => {
    getAllRequests();
  }, [general.refreshState, status]);

  return (
    <div className={css["all-requests"]}>
      <div className={css.search}>
        <SidebarSearch
          icon="fa fa-search"
          actionIcon="fa-solid fa-user-plus"
          placeholder="Search for people"
          all={false}
          active="Sent"
          inActive="Recieved"
          onActiveClick={sent}
          onInActiveClick={recieved}
          onAllLink="/?tab=requests&query=all"
          onActiveLink="/?tab=requests&query=sent"
          onInActiveLink="/?tab=requests&query=recieved"
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
            <RequestMapComponents
              title="Requests"
              addUserIcon={false}
              profiles={requests}
              addMessagesCount={false}
              notFoundMessage="No group was found..."
              userId={props.userId}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default Requests;

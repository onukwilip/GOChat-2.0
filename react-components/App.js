import "./App.css";
import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { useRouter, Route, Routes } from "next/router";
import { General } from "./context/GeneralContext";

function App() {
  const [userId, setUserId] = useState();
  const [loading, setLoading] = useState(false);
  const navigate = useRouter();
  const general = useContext(General);
  const apiPrefix = general.domain;
  const config = general.config;
  const url = apiPrefix + `api/user/${userId}`;

  //USER IS ONLINE
  const isOnline = () => {
    const url = apiPrefix + `api/user/isOnline`;
    const body = {
      UserID: userId ? userId : "undefined",
      isOnline: true,
    };
    axios
      .put(url, body, config)
      .then((res) => {
        console.log("Is Online", res.data);
      })
      .catch((e) => {
        console.log("Error", e);
      });
  };

  //USER IS OFFLINE
  const isOffline = () => {
    const url = apiPrefix + `api/user/isOnline`;
    const body = {
      UserID: userId ? userId : "undefined",
      isOnline: false,
    };
    axios
      .put(url, body, config)
      .then((res) => {
        console.log("Is Offline", res.data);
      })
      .catch((e) => {
        console.log("Error", e);
      });
  };

  //USER WAS LAST SEEN AFTER HE WENT OFFLINE
  const lastSeen = () => {
    const url =
      apiPrefix + `api/user/lastSeen/${userId ? userId : "undefined"}`;
    axios
      .put(url, config)
      .then((res) => {
        console.log("Res", res.data);
      })
      .catch((e) => {
        console.log("Error", e);
      });
  };

  //VERIFY IF USER IS LOGGED IN
  const verifyUser = async () => {
    setLoading(true);

    const ipUrl = "https://geolocation-db.com/json/";

    const ip = await axios.get(ipUrl).catch((e) => {});
    const ipAddress = ip?.data?.IPv4;
    general.setIpAddress(ip?.data?.IPv4);

    //IF LOCALSTORAGE.USERID IS EMPTY
    if (userId !== null && userId !== "") {
      //CALL API
      axios
        .get(`${url}/${general.toBase64(ipAddress)}`, general.config)
        .then((res) => {
          setLoading(false);

          const user = res.data;
          //IF USER DOESN'T EXIST
          if (
            user.Response.UserExists === false ||
            user.Response.IsAuthenticated === false
          ) {
            setLoading(false);

            //NAVIGATE TO LOGIN
            console.log("User", user);
            navigate("/login", { replace: true });
          }
          //ELSE
          else {
            setLoading(false);

            localStorage.setItem("UserId", user.UserID);
            console.log(user);
            //NAVIGATE TO CHAT ENGINE
            navigate("/chat", { replace: true });
            //CALL THE isOnline FUNCTION
            // alert("Not exist");
          }
        })
        //IF ERROR NAVIGATE TO LOGIN
        .catch((e) => {
          setLoading(false);

          console.log("error", e);
          navigate("/login", { replace: true });
        });
    }
    //IF LOCALSTORAGE.USERID IS EMPTY
    else {
      setLoading(false);

      //NAVIGATE TO LOGIN
      navigate("/login", { replace: true });
    }
  };

  useEffect(() => {
    verifyUser();
    isOnline();
    setUserId(localStorage.getItem("UserId"));
    return () => {
      isOffline();
      lastSeen();
    };
  }, []);

  return <div>Hello</div>;
}

export default App;

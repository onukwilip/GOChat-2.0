import React, { useContext, useEffect, useState } from "react";
import css from "./Navbar.module.css";
import dummy from "../../../assets/images/dummy-img.png";
import { useRouter } from "next/router";
import Link from "next/link";
import axios from "axios";
import { General } from "../../../context/GeneralContext";

const Navbar = (props) => {
  const navigate = useRouter();
  const general = useContext(General);
  const apiPrefix = general.domain;
  const config = general.config;
  const [userId, setUserId] = useState("");
  const url = apiPrefix + `api/user/IPAddress/`;

  //GET IP ADDRESS OF USER
  const getUserIPAddress = () => {
    const ipUrl = "https://geolocation-db.com/json/";
    axios
      .get(ipUrl)
      .then((res) => {
        //Call my API to remove IP address from database
        logOut(res.data.IPv4);
      })
      .catch((e) => {});
  };

  const logOut = (ipAddress) => {
    // const userId = localStorage.getItem("UserId");
    axios
      .delete(`${url}${userId}/${general.toBase64(ipAddress)}`)
      .then((res) => {
        console.log("User logged out successfully ", res.data);
      })
      .catch();
    localStorage.removeItem("UserId");
    navigate.replace("/login");
  };

  useEffect(() => {
    setUserId(localStorage.getItem("UserId"));
  }, []);
  return (
    <>
      <section className={css.navbar}>
        <div className={css["l-side"]}>
          <div className={css["img-container"]}>
            <img src={props.image ? props.image : dummy?.src} alt="img" />
          </div>

          <Link
            href="/?tab=contacts"
            shallow
            className={({ isActive }) => (isActive ? css.active : "")}
          >
            <div>
              <i className="fa fa-circle-user" aria-hidden="true"></i>
            </div>
          </Link>

          <Link
            href="/?tab=messages"
            className={({ isActive }) => (isActive ? css.active : "")}
          >
            <div>
              <i className="fa-regular fa-message"></i>
            </div>
          </Link>

          <Link
            href="/?tab=notifications"
            className={({ isActive }) => (isActive ? css.active : "")}
          >
            <div>
              <i class="fa-regular fa-bell"></i>
            </div>
          </Link>

          <Link
            href="/?tab=all-contacts"
            className={({ isActive }) => (isActive ? css.active : "")}
          >
            <div>
              <i class="fa fa-user-plus"></i>
            </div>
          </Link>

          <Link
            href="/?tab=requests"
            className={({ isActive }) => (isActive ? css.active : "")}
          >
            <div>
              <i class="fa-sharp fa-solid fa-users"></i>
            </div>
          </Link>
        </div>
        <div className={css["r-side"]}>
          <Link
            href={`?tab=user&userid=${general.toBase64(userId)}`}
            className={({ isActive }) => (isActive ? css.active : "")}
          >
            <div>
              <i className="fa-solid fa-gear"></i>
            </div>
          </Link>

          <div className={css["power-container"]} onClick={getUserIPAddress}>
            <i className={`fa-solid fa-power-off ${css.power}`}></i>
          </div>
        </div>
      </section>
    </>
  );
};

export default Navbar;

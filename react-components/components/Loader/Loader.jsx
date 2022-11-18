import React from "react";
import css from "./Loader.module.css";
import loader from "../../assets/images/icons8-chat-64 (1).png";

const Loader = () => {
  return (
    <>
      <div className={css.loader}>
        <img src={loader?.src} alt="" />
      </div>
    </>
  );
};

export default Loader;

import React from "react";
import css from "./ServerError.module.css";

const ServerError = () => {
  return (
    <>
      <div className={css["server-error"]}>
        <div className={css["icon-container"]}>
          <i className="fa-solid fa-face-sad-tear"></i>
        </div>
        <div className={css.error + " error"}>
          <em>There was an error connecting with the server</em>
        </div>
      </div>
    </>
  );
};

export default ServerError;

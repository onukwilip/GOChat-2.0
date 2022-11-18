import React from "react";
import css from "./NoItem.module.css";

const NoItem = (props) => {
  return (
    <>
      <div className={css["no-item"]}>
        <div className={css["icon-container"]}>
          <i className="fa-solid fa-face-meh"></i>
        </div>
        <div className={css.message}>
          <em>{props.message}</em>
        </div>
      </div>
    </>
  );
};

export default NoItem;

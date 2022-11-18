import React from "react";
import css from "./Button.module.css";

export const Button = (props) => {
  const onClick = () => {
    if (typeof props.onClick === "function") {
      props.onClick();
    }
  };

  return (
    <button
      type={props.type}
      onClick={onClick}
      onDoubleClick={props.onDoubleClick}
      className={`${css.button} ${props.className}`}
      style={props.style}
      disabled={props.disabled}
    >
      {props.children}
    </button>
  );
};

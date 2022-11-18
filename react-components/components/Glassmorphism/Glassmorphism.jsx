import React from "react";
import css from "./Glassmorphism.module.css";

const Glassmorphism = (props) => {
  return (
    <div className={`${css["glassmorphism"]} ${props.className}`}>
      {props.children}
    </div>
  );
};

export default Glassmorphism;

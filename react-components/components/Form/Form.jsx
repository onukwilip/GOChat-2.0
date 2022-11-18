import React from "react";
import css from "./Form.module.css";

export const Form = (props) => {
  const onSubmit = (e) => {
    e.preventDefault();

    if (typeof props.onSubmit === "function") {
      props.onSubmit();
    }
  };

  return (
    <div className={`${css["form-container"]} ${props.className}`}>
      <form className={`${css.form}`} onSubmit={onSubmit}>
        {props.children}
      </form>
    </div>
  );
};

export const FormGroup = (props) => {
  if (props.type === "textarea") {
    return (
      <div className={css.textarea}>
        <textarea
          placeholder={props.placeholder}
          onChange={props.onChange}
          required={props.required}
          disabled={props.disabled}
        >
          {props.children}
        </textarea>
      </div>
    );
  }

  return (
    <label className={`${css["form-group"]} ${props.className}`}>
      <div className={css["form-icon"]}>
        <i
          className={props.icon}
          aria-hidden="true"
          onClick={() => {
            props.onClick();
          }}
        ></i>
      </div>
      <div className={css["form-tag"]}>
        <input
          type={props.type}
          name={props.name}
          placeholder={props.placeholder}
          value={props.value}
          onChange={props.onChange}
          required={props.required}
          disabled={props.disabled}
        />
      </div>
    </label>
  );
};

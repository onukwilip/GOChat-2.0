import Head from "next/head";
import React from "react";
import Login from "../react-components/_pages/Login/Login";

const LoginPage = () => {
  return (
    <>
      <Head>
        <title>GO Chat</title>
        <meta
          name="description"
          content="Login to GOChat to continue chatting with your fellas 😁"
        />
        <link rel="icon" href="\icons8-chat-64 (1).png" />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.1.2/css/all.min.css"
          integrity="sha512-1sCRPdkRXhBV2PBLUdRb4tMg1w2YPf37qatUFeS7zlBy7jJI8Lf4VHwWfZZfpXtYSLy85pkm9GaYVYMfw5BC1A=="
          crossorigin="anonymous"
          referrerpolicy="no-referrer"
        />
      </Head>
      <Login />
    </>
  );
};

export default LoginPage;

import Head from "next/head";
import Image from "next/image";
import ChatEngine from "../react-components/_pages/ChatEngine/ChatEngine";
import React, { use, useContext, useEffect, useState } from "react";
import { General } from "../react-components/context/GeneralContext";
import axios from "axios";
import { setCookie, getCookie } from "cookies-next";
import { Calls, decrypt, encrypt } from "../ExternalFunctions";
import Modal from "../react-components/components/Modal/Modal";
import requestIp from "request-ip";
import { useRouter } from "next/router";
import Loader from "../react-components/components/Loader/Loader";

export default function ChatEnginePage(props) {
  const general = useContext(General);
  const [loading, setLoading] = useState(true);
  const navigate = useRouter();
  const userid = getCookie("user-id"); //props.userid;

  const validateUser = async () => {
    setLoading(true);
    const calls = new Calls();
    const data = await calls.verifyUser(axios);

    if (!data) {
      navigate.replace("/login");
    } else {
      setLoading(false);
    }
  };

  useEffect(() => {
    validateUser();
  }, []);

  if (loading) {
    return (
      <>
        <div>
          <Head>
            <title>GO Chat</title>
            <meta
              name="description"
              content="GOChat brings you and your friends together from all over the world"
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

          <>
            <div className="loader-container">
              <Loader />
            </div>
          </>
        </div>
        {general.modalState === "true" && <Modal />}
      </>
    );
  }

  return (
    <>
      <div>
        <Head>
          <title>GO Chat</title>
          <meta
            name="description"
            content="GOChat brings you and your friends together from all over the world"
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

        <>
          <ChatEngine userId={userid} />
        </>
      </div>
      {general.modalState === "true" && <Modal />}
    </>
  );
}

/* export const getServerSideProps = async ({ req, res }) => {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
  const api = axios.create();
  const refresh_token = decrypt(getCookie("refresh-token", { req, res }));
  const userid = getCookie("user-id", { req, res });
  let fetching = false;

  //API INSTANCE REQUEST INTERCEPTOR
  api.interceptors.request.use(
    (request) => {
      req.headers = {
        "Content-type": "application/json;charset=UTF-8",
        ...req.headers,
      };

      if (
        request?.url.toLowerCase().includes(process.env.API_DOMAIN) &&
        request?.url !== `${process.env.API_DOMAIN}token` &&
        request?.url !== `${process.env.CLIENT_DOMAIN}api/refresh_token` &&
        request?.url !== `${process.env.CLIENT_DOMAIN}api/access_token`
      ) {
        //GET THE ACCESS TOKEN COOKIE
        const accessToken = decrypt(getCookie("access-token", { req, res }));
        //APPEND IT AS AN AUTHORIZATION HEADER
        request.headers = {
          ...request.headers,
          Authorization: `Bearer ${decrypt(accessToken)}`,
        };
      }
      if (request.url === `${process.env.CLIENT_DOMAIN}api/refresh_token`) {
        request.data = {
          refresh_token: refresh_token,
        };
      }

      return request;
    },
    (err) => {
      Promise.reject(err);
    }
  );

  //API INSTANCE RESPONSE INTERCEPTOR
  api.interceptors.response.use(
    (response) => {
      //IF THE RESPONSE URL IS THE REFRESH-TOKEN ENDPOINT
      if (
        response?.config?.url ===
        `${process.env.CLIENT_DOMAIN}api/refresh_token`
      ) {
        console.log("Token response", response?.data);
        //SET THE REFRESH TOKEN COOKIE
        setCookie("refresh-token", encrypt(response?.data?.refresh_token), {
          req,
          res,
          httpOnly: true,
          path: "/",
          secure: true,
          sameSite: "strict",
        });
      }
      //RETURN THE SUCCESSFULL RESPONSE
      return response;
    },
    async (err) => {
      const originalConfig = err?.config;
      //CHECKS IF A REQUEST RETURNED 401 ERROR AND THE REQUEST TOKEN ENDPOINT HAS NOT BEEN CALLED
      if (
        err?.response?.status === 401 &&
        !fetching &&
        originalConfig?.url?.toLowerCase()?.includes(process.env.API_DOMAIN)
      ) {
        //SET FETCHING TO TRUE
        fetching = true;
        //CALL THE NEXT-JS REFRESH-TOKEN ENDPOINT
        const refresh_token = await api
          .post(`${process.env.CLIENT_DOMAIN}api/refresh_token`, {}, {})
          //IF THE ERROR RESPONDED WITH STATUS CODE 400 OR OTHERWISE
          .catch((e) => {
            //SET FETCHING TO FALSE
            fetching = false;
            //RETURN THE INITIAL RESPONSE ERROR
            return Promise.reject(e);
          });

        //IF THE REFRESH-TOKEN WAS GENERATED SUCCESSFULLY
        if (refresh_token) {
          //SET THE ACCESS TOKEN COOKIE AND SET THE TIMEOUT
          setCookie(
            "access-token",
            encrypt(refresh_token?.data?.access_token),
            { req, res }
          );
          //SET THE FETCHING TO FALSE AFTER 1 MINUTE
          setTimeout(() => {
            fetching = false;
          }, 12000);
          //RESEND THE REQUEST
          return api(originalConfig);
        } else {
          fetching = false;
          return Promise.reject("Could not retrieve refresh token");
        }
      }
      //CHECKS IF A REQUEST RETURNED 401 ERROR AND THE REQUEST TOKEN ENDPOINT HAS ALREADY BEEN CALLED
      else if (
        err?.response?.status === 401 &&
        fetching &&
        originalConfig?.url?.toLowerCase()?.includes(process.env.API_DOMAIN)
      ) {
        //RESEND THE REQUEST
        return api(originalConfig);
      }
      //IF THE RESPONSE ERROR IS NOT 401 AND NOT FROM GOCHAT API
      else {
        //RETURN THE ERROR
        return Promise.reject(err);
      }
    }
  );

  const calls = new Calls();

  //VERIFY IF USER IS LOGGED IN
  const verified = await calls.verifyUser(api).catch((e) => null);
  // //GET ALL USER CHATROOMS
  // const chatRooms = await calls.getChatRooms(api).catch((e) => null);
  // //GET USER DETAILS
  // const user = await calls.getUser(api).catch((e) => null);
  // //GET USER DISCUSSIONS
  // const discussions = await calls.getDiscussions(api).catch((e) => null);
  // //GET USER NOTIFICATIONS
  // const notifications = await calls.getNotifications(api).catch((e) => null);
  // //GET ALL USERS
  // const allUsers = await calls.getAllUsers(api).catch((e) => null);
  // //GET ALL PUBLIC GROUPS
  // const allGroups = await calls.getAllGroups(api).catch((e) => null);
  // //GET USER SENT REQUESTS
  // const sentRequests = await calls.getSentRequests(api).catch((e) => null);
  // //GET USER RECIEVED REQUESTS
  // const recievedRequests = await calls
  //   .getRecievedRequests(api)
  //   .catch((e) => null);

  //GET USER'S IP ADDRESS
  const ip = requestIp.getClientIp(req);

  console.log("IP address", ip);

  if (!verified) {
    return {
      redirect: {
        destination: "/login",
        permanent: true,
      },
    };
  }

  return {
    props: {
      // chatRooms: chatRooms ? chatRooms : [],
      // user: user ? user : {},
      // discussions: discussions ? discussions : [],
      // notifications: notifications ? notifications : [],
      // allUsers: allUsers ? allUsers : [],
      // allGroups: allGroups ? allGroups : [],
      // sentRequests: sentRequests ? sentRequests : [],
      // recievedRequests: recievedRequests ? recievedRequests : [],
      userid: userid,
      ip: ip ? ip : "",
    },
  };
}; */

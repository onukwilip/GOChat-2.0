import "../styles/globals.css";
import GeneralContext from "../react-components/context/GeneralContext";
import axios from "axios";
import { setCookie, getCookie } from "cookies-next";
import { convertToBase64, decrypt, encrypt } from "../ExternalFunctions";
import { useEffect } from "react";

//DETERMINES IF THE INTERCEPTOR HAS CALLED THE REFRESH_TOKEN ENDPOINT
let fetching = false;
const userid = getCookie("user-id");

// //AXIOS RESPONSE INTERCEPTOR
// axios.interceptors.response.use(
//   async (res) => {
//     //IF THE RESPONSE URL IS THE REFRESH-TOKEN ENDPOINT
//     if (res?.config?.url === `${process.env.CLIENT_DOMAIN}api/refresh_token`) {
//       console.log("Token response", res);
//     }
//     //RETURN THE SUCCESSFULL RESPONSE
//     return res;
//   },
//   async (err) => {
//     const originalConfig = err?.config;
//     //CHECKS IF A REQUEST RETURNED 401 ERROR AND THE REQUEST TOKEN ENDPOINT HAS NOT BEEN CALLED
//     if (
//       err?.response?.status === 401 &&
//       !fetching &&
//       originalConfig?.url?.toLowerCase()?.includes(process.env.API_DOMAIN)
//     ) {
//       //SET FETCHING TO TRUE
//       fetching = true;
//       //CALL THE NEXT-JS REFRESH-TOKEN ENDPOINT
//       const refresh_token = await axios
//         .post(`${process.env.CLIENT_DOMAIN}api/refresh_token`, {}, {})
//         //IF THE ERROR RESPONDED WITH STATUS CODE 400 OR OTHERWISE
//         .catch((e) => {
//           //SET FETCHING TO FALSE
//           fetching = false;
//           //RETURN THE INITIAL RESPONSE ERROR
//           return Promise.reject(e);
//         });

//       //IF THE REFRESH-TOKEN WAS GENERATED SUCCESSFULLY
//       if (refresh_token) {
//         //SET THE ACCESS TOKEN COOKIE AND SET THE TIMEOUT
//         setCookie("access-token", encrypt(refresh_token?.data?.access_token));
//         //SET THE FETCHING TO FALSE AFTER 1 MINUTE
//         setTimeout(() => {
//           fetching = false;
//         }, 12000);
//         //RESEND THE REQUEST
//         return axios(originalConfig);
//       } else {
//         fetching = false;
//         return Promise.reject("Could not retrieve refresh token");
//       }
//     }
//     //CHECKS IF A REQUEST RETURNED 401 ERROR AND THE REQUEST TOKEN ENDPOINT HAS ALREADY BEEN CALLED
//     else if (
//       err?.response?.status === 401 &&
//       fetching &&
//       originalConfig?.url?.toLowerCase()?.includes(process.env.API_DOMAIN)
//     ) {
//       //RESEND THE REQUEST
//       return axios(originalConfig);
//     }
//     //IF THE RESPONSE ERROR IS NOT 401 AND NOT FROM GOCHAT API
//     else {
//       //RETURN THE ERROR
//       return Promise.reject(err);
//     }
//   }
// );

// //AXIOS REQUEST INTERCEPTOR
// axios.interceptors.request.use(
//   async (req) => {
//     //LIKELY TO BE REMOVED
//     req.headers = {
//       "Content-type": "application/json;charset=UTF-8",
//       ...req.headers,
//     };

//     //IF THE ENDPOINT IS GOCHAT API'S AND IS NOT THE REFRESH-TOKEN ENDPOINT
//     if (
//       req?.url.toLowerCase().includes(process.env.API_DOMAIN) &&
//       req?.url !== `${process.env.API_DOMAIN}token` &&
//       req?.url !== `${process.env.CLIENT_DOMAIN}api/refresh_token` &&
//       req?.url !== `${process.env.CLIENT_DOMAIN}api/access_token`
//     ) {
//       //GET THE ACCESS TOKEN COOKIE
//       const accessToken = getCookie("access-token");
//       //APPEND IT AS AN AUTHORIZATION HEADER
//       req.headers = {
//         ...req.headers,
//         Authorization: `Bearer ${decrypt(accessToken)}`,
//       };
//     }

//     //IF THE ENDPOINT IS THE REFRESH-TOKEN ENDPOINT
//     if (req?.url === `${process.env.API_DOMAIN}token`) {
//       //SET THE BASIC AUTHORIZATION HEADER AND OTHER HEADERS
//       req.headers = {
//         ...req.headers,
//         Authorization: `Basic ${convertToBase64(
//           process.env.CLIENT_ID + ":" + process.env.CLIENT_SECRET
//         )}`,
//         "Content-type": "application/x-www-form-urlencoded",
//         "Access-control-allow-origin": "*", //http://localhost:3000
//         Accept: "*/*",
//       };
//       //SET THE WITH-CREDENTIALS TO TRUE, INORDER TO SET COOKIE FROM SERVER TO CLIENT
//       req.withCredentials = true;
//     }
//     //RETURN THE REQUEST
//     return req;
//   },
//   //IF THERE IS A REQUEST ERROR, RETURN THE ERROR
//   (err) => Promise.reject(err)
// ); */

//AXIOS RESPONSE INTERCEPTOR
axios.interceptors.response.use(
  async (res) => {
    //IF THE RESPONSE URL IS THE REFRESH-TOKEN ENDPOINT
    if (res?.config?.url === `${process.env.API_DOMAIN}token`) {
      console.log("Token response", res);
    }
    //RETURN THE SUCCESSFULL RESPONSE
    return res;
  },
  async (err) => {
    const originalConfig = err?.config;
    //CHECKS IF A REQUEST RETURNED 401 ERROR AND THE REQUEST TOKEN ENDPOINT HAS NOT BEEN CALLED
    if (
      err?.response?.status === 401 &&
      !fetching &&
      originalConfig?.url
        ?.toLowerCase()
        ?.includes(process.env.API_DOMAIN?.toLowerCase())
    ) {
      //SET FETCHING TO TRUE
      fetching = true;
      const params = new URLSearchParams();
      params.append("refresh_token", "null");
      params.append("grant_type", "refresh_token");

      //CALL THE REFRESH-TOKEN ENDPOINT
      const refresh_token = await axios
        .post(`${process.env.API_DOMAIN}token`, params)
        //IF THE ERROR RESPONDED WITH STATUS CODE 400 OR OTHERWISE
        .catch();

      //IF THE REFRESH-TOKEN WAS GENERATED SUCCESSFULLY
      if (refresh_token) {
        //SET THE ACCESS TOKEN COOKIE AND SET THE FETCHING TO FALSE
        setCookie("access-token", encrypt(refresh_token?.data?.access_token));
        setTimeout(() => {
          fetching = false;
        }, 12000);
        //RESEND THE REQUEST
        return axios(originalConfig);
      }
    }
    //CHECKS IF A REQUEST RETURNED 401 ERROR AND THE REQUEST TOKEN ENDPOINT HAS ALREADY BEEN CALLED
    else if (
      err?.response?.status === 401 &&
      fetching &&
      originalConfig?.url
        ?.toLowerCase()
        ?.includes(process.env.API_DOMAIN?.toLowerCase())
    ) {
      //RESEND THE REQUEST
      return axios(originalConfig);
    }
    //IF THE RESPONSE ERROR IS NOT 401 AND NOT FROM GOCHAT API
    else {
      //IF THE REFRESH TOKEN ENDPOINT RETURNS STATUS 400 OR OTHERWISE
      if (originalConfig?.url === `${process.env.API_DOMAIN}token`) {
        //SET FETCHING TO FALSE
        fetching = false;
        //RETURN THE INITIAL RESPONSE ERROR
        return Promise.reject(err);
      }
      //RETURN THE ERROR
      return Promise.reject(err);
    }
  }
);

//AXIOS REQUEST INTERCEPTOR
axios.interceptors.request.use(
  async (req) => {
    //LIKELY TO BE REMOVED
    req.headers = {
      ...req.headers,
      "Content-type": "application/json;charset=UTF-8",
    };

    //IF THE ENDPOINT IS GOCHAT API'S AND IS NOT THE REFRESH-TOKEN ENDPOINT
    if (
      req?.url.toLowerCase().includes(process.env.API_DOMAIN?.toLowerCase()) &&
      req?.url !== `${process.env.API_DOMAIN}token`
    ) {
      //GET THE ACCESS TOKEN COOKIE
      const accessToken = getCookie("access-token");
      //APPEND IT AS AN AUTHORIZATION HEADER
      req.headers["Authorization"] = `Bearer ${decrypt(accessToken)}`;
    }

    //IF THE ENDPOINT IS THE REFRESH-TOKEN ENDPOINT
    if (req?.url === `${process.env.API_DOMAIN}token`) {
      //SET THE BASIC AUTHORIZATION HEADER AND OTHER HEADERS
      req.headers = {
        ...req.headers,
        Authorization: `Basic ${convertToBase64(
          process.env.CLIENT_ID + ":" + process.env.CLIENT_SECRET
        )}`,
        "Content-type": "application/x-www-form-urlencoded",
        "Access-control-allow-origin": "*",
        Accept: "*/*",
      };

      //SET THE WITH-CREDENTIALS TO TRUE, INORDER TO SET COOKIE FROM SERVER TO CLIENT
      req.withCredentials = true;
    }

    //RETURN THE REQUEST
    return req;
  },
  //IF THERE IS A REQUEST ERROR, RETURN THE ERROR
  (err) => Promise.reject(err)
);

//USER IS OFFLINE
const isOffline = async () => {
  const url = `${process.env.API_DOMAIN}api/user/isOnline`;
  const body = {
    isOnline: false,
    UserID: userid ? userid : "",
  };
  const response = await axios.put(url, body).catch((e) => {});

  if (response) {
    console.log("Is Offline", response.data);
  }
};

//USER IS ONLINE
const isOnline = async () => {
  const url = `${process.env.API_DOMAIN}api/user/isOnline`;
  const body = {
    isOnline: true,
    UserID: userid ? userid : "",
  };
  const response = await axios.put(url, body).catch((e) => {});

  if (response) {
    console.log("Is Online", response.data);
  }
};

function MyApp({ Component, pageProps }) {
  useEffect(() => {
    isOnline();
    return () => {
      isOffline();
    };
  }, []);

  return (
    <GeneralContext>
      <Component {...pageProps} />
    </GeneralContext>
  );
}

export default MyApp;

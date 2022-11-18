const axios = require("axios");
const https = require("https");
const http = require("http");
import { convertToBase64, encrypt } from "../../ExternalFunctions";
const { setCookie, getCookie, deleteCookie } = require("cookies-next");

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const handler = async (req, res) => {
  const httpAgent = new http.Agent({
    rejectUnauthorized: false,
  });
  const httpsAgent = new https.Agent({
    rejectUnauthorized: false,
  });

  const params = new URLSearchParams();
  params.append("username", req.body?.username);
  params.append("password", req.body?.password);
  params.append("grant_type", "password");
  const config = {
    headers: {
      Authorization: `Basic ${convertToBase64(
        process.env.CLIENT_ID + ":" + process.env.CLIENT_SECRET
      )}`,
    },
  };
  //CALL THE ACCESS-TOKEN GO-CHAT API ACCESS TOKEN ENDPOINT
  axios
    .post(
      `${process.env.API_DOMAIN}token`,
      params,
      config,
      { httpAgent: httpAgent },
      { httpsAgent: httpsAgent }
    )
    .then((access_token_endpoint) => {
      setCookie(
        "refresh-token",
        encrypt(access_token_endpoint?.data?.refresh_token),
        {
          req,
          res,
          httpOnly: true,
          path: "/",
          secure: true,
          sameSite: "strict",
        }
      );

      return res.status(200).json(access_token_endpoint?.data);
    })
    //IF THE ERROR RESPONDED WITH STATUS CODE 400 OR OTHERWISE
    .catch((e) => {
      console.log(e);
      return res.status(400).json(e);
    });

  //   return res.status(400).json({ message: "Could not validate token" });
};

export default handler;

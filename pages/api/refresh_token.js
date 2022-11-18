import axios from "axios";
const https = require("https");
const http = require("http");
import { convertToBase64, decrypt, encrypt } from "../../ExternalFunctions";
const { setCookie, getCookie, deleteCookie } = require("cookies-next");

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const handler = async (req, res) => {
  const httpAgent = new http.Agent({
    rejectUnauthorized: false,
  });
  const httpsAgent = new https.Agent({
    rejectUnauthorized: false,
  });
  const refresh_token = decrypt(getCookie("refresh-token", { req, res }));
  const params = new URLSearchParams();
  params.append(
    "refresh_token",
    refresh_token ? refresh_token : req?.body?.refresh_token
  );
  params.append("grant_type", "refresh_token");
  const config = {
    headers: {
      Authorization: `Basic ${convertToBase64(
        process.env.CLIENT_ID + ":" + process.env.CLIENT_SECRET
      )}`,
    },
  };
  //CALL THE REFRESH-TOKEN GO-CHAT API REFRESH TOKEN ENDPOINT
  axios
    .post(
      `${process.env.API_DOMAIN}token`,
      params,
      config,
      { httpAgent: httpAgent },
      { httpsAgent: httpsAgent }
    )
    .then((refresh_token_endpoint) => {
      setCookie(
        "refresh-token",
        encrypt(refresh_token_endpoint?.data?.refresh_token),
        {
          req,
          res,
          httpOnly: true,
          path: "/",
          secure: true,
          sameSite: "strict",
        }
      );

      return res.status(200).json(refresh_token_endpoint?.data);
    })
    //IF THE ERROR RESPONDED WITH STATUS CODE 400 OR OTHERWISE
    .catch((e) => {
      console.log(e);
      return res.status(400).json(e);
    });
};

export default handler;

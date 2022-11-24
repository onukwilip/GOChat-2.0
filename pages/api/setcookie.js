const { setCookie, getCookie, deleteCookie } = require("cookies-next");

export default function handler(req, res) {
  const { body } = req;
  const { headers } = req;

  if (req.method === "POST") {
    setCookie(body.key, body.value, {
      req,
      res,
      httpOnly: true,
      path: "/",
    });
    return res.status(200).json("Cookie added successfully");
  } else if (req.method === "GET") {
    const _value = getCookie(headers?.key, { req, res });
    return res.status(200).json({ key: headers?.key, value: _value });
  } else if (req.method === "DELETE") {
    const cookie = headers["x-key"];

    if (cookie === "*") {
      deleteCookie("access-token", { res, req });
      deleteCookie("refresh-token", { res, req });
      deleteCookie("user-id", { res, req });
    } else {
      deleteCookie(cookie, { req, res });
    }
    return res.status(200).json("Cookie deleted successfully");
  }
}

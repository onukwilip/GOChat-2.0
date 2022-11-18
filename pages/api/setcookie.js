const { setCookie, getCookie, deleteCookie } = require("cookies-next");

export default function handler(req, res) {
  if (req.method === "POST") {
    const { body } = req;
    setCookie(body.key, body.value, {
      req,
      res,
      httpOnly: true,
      path: "/",
    });
    res.status(200).json(body);
  } else if (req.method === "GET") {
    const { headers } = req;
    const _value = getCookie(headers?.key, { req, res });
    res.status(200).json({ key: headers?.key, value: _value });
  }
}

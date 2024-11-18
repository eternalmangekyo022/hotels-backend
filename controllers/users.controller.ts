import { login, register, refresh } from "../models/users.model";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config({ path: "./.env" });

type LoginReqBody = {
  email: string;
  password: string;
};

export default {
  login: async (req: Req<LoginReqBody>, res: Res) => {
    const user = await login(req.body.email, req.body.password);

    const accessToken = jwt.sign(
      { email: user.email, id: user.id },
      process.env.JWT_ACCESS_SECRET!,
      { expiresIn: "15m" } // Short expiry for access token
    );

    const refreshToken = jwt.sign(
      { email: user.email, id: user.id },
      process.env.JWT_REFRESH_SECRET!,
      { expiresIn: "7d" } // Longer expiry for refresh token
    );

    // Optionally store refresh token in a secure location (e.g., database or cache)

    res.json({
      user,
      accessToken,
      refreshToken, // Send refresh token to client
    });
  },
  register: async (
    {
      body: { firstname, lastname, phone, email, password },
    }: Req<any, UserRegister>,
    res: Res
  ) => {
    const user = await register({
      firstname,
      lastname,
      phone,
      email,
      password,
    });
    res.json(user);
  },
  refresh: async (
    { body: { refreshToken } }: Req<any, { refreshToken: string }>,
    res: Res
  ) => {
    if (!refreshToken) throw { message: "Missing refresh token", code: 400 };
    res.json({ accessToken: await refresh(refreshToken) });
  },
};

// HTTP 400 codes
// https://developer.mozilla.org/en-US/docs/Web/HTTP/Status#client_error_responses
// 400 Bad Request
// 401 Unauthorized
// 402 Payment Required
// 403 Forbidden
// 404 Not Found
// 405 Method Not Allowed
// 406 Not Acceptable
// 407 Proxy Authentication Required
// 408 Request Timeout
// 409 Conflict
// 410 Gone
// 411 Length Required
// 412 Precondition Failed
// 413 Payload Too Large
// 414 URI Too Long
// 415 Unsupported Media Type
// 416 Range Not Satisfiable
// 417 Expectation Failed
// 418 I'm a teapot (this is a real status code, courtesy of IETF April Fool's joke in 1998)

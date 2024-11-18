/**
 * Handles user authentication and authorization
 * @namespace controllers/users
 */

import * as model from "../models/users.model";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config({ path: "./.env" });

type LoginReqBody = {
  email: string;
  password: string;
};

type UserRegister = {
  firstname: string;
  lastname: string;
  phone: string;
  email: string;
  password: string;
};
export async function login(req: Req<LoginReqBody>, res: Res) {
  const user = await model.login(req.body.email, req.body.password);

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

  res.cookie("accessToken", accessToken, {
    httpOnly: true, // Prevent client-side access to the cookie
    secure: process.env.NODE_ENV === "production", // Use HTTPS in production
    sameSite: "strict", // Prevent CSRF attacks
    maxAge: 900 * 1000, // 1 hour
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true, // Prevent client-side access to the cookie
    secure: process.env.NODE_ENV === "production", // Use HTTPS in production
    sameSite: "strict", // Prevent CSRF attacks
    maxAge: 24 * 60 * 60 * 1000, // 1 week
  });

  res.json({ user });
}

/**
 * @function register
 * @description Handles user registration
 */
export async function register(
  { body: { firstname, lastname, phone, email, password } }: Req<UserRegister>,
  res: Res
) {
  const user = await model.register({
    firstname,
    lastname,
    phone,
    email,
    password,
  });
  res.json(user);
}

/**
 * @function refresh
 * @description Handles token refresh
 */
export async function refresh(
  { body: { refreshToken } }: Req<{ refreshToken: string }>,
  res: Res
) {
  if (!refreshToken) throw { message: "Missing refresh token", code: 400 };
  res.cookie("accessToken", await model.refresh(refreshToken), {
    httpOnly: true,
    maxAge: 900 * 1000,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
  });
  res.send();
}
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
// 418 I'm a teapot

import { Request, Response, NextFunction, Express as Exp } from "express";

declare global {
  interface Req<T = any> extends Request<any, any, T> {
    user?: TokenVerified;
  }
  interface Res extends Response {}
  interface Next extends NextFunction {}
  type Express = Exp;

  interface Err {
    message: string;
    code: number;
  }

  interface User {
    id: number;
    firstname: string;
    lastname: string;
    permission: string;
    phone: string;
    email: string;
    registered: Date;
    password: string;
  }

  type UserRegister = Omit<User, "permission" | "registered" | "id">;

  interface TokenVerified {
    id: number;
    email: string;
    iat: number;
  }

  type UseFn = (
    fn: (...args: any[]) => any
  ) => (req: Req, res: Res, next: Next) => Promise<any>;
}

export {};

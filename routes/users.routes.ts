import { Router } from "express";
import * as users from "../controllers/users.controller";

export default (use: UseFn, app: Express) => {
  const router = Router();
  router.post("/login", use(users.login));
  router.post("/register", use(users.register));
  router.post("/refresh", use(users.refresh));
  //delete user
  //update user
  //get user
  //patch user

  app.use("/", router);
};

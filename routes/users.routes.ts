import { Router } from "express";
import users from "../controllers/users.controller";

export default (use: UseFn, app: Express) => {
  const router = Router();
  router.post("/login", use(users.login));
  router.post("/register", use(users.register));
  router.post("/refresh", use(users.refresh));

  app.use("/", router);
};

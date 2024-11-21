import { Router } from "express";
import * as users from "../controllers/users.controller";

export default (use: UseFn, app: Express) => {
  const router = Router({ mergeParams: true });
  router.post("/login", use(users.login));
  router.post("/register", use(users.register));
  router.post("/refresh", use(users.refresh));

  const userRouter = Router({ mergeParams: true });
  userRouter.delete("/:userId", use(users.deleteUser));
  //delete user
  //update user
  //get user
  //patch user
  router.use("/user", userRouter);
  app.use("/", router);
};

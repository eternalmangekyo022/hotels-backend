import controller from "../controllers/hotels.controller";
import { Router } from "express";

export default (use: UseFn, app: Express) => {
  const router = Router();

  router.get("/", use(controller.getHotels));
  app.use("/hotels", router);
};

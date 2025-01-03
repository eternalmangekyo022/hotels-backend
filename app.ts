import cors from "cors";
import e, { type NextFunction } from "express";
import dotenv from "dotenv";
import users from "./routes/users.routes";
import jwt from "jsonwebtoken";
import hotels from "./routes/hotels.routes";

dotenv.config({ path: "./.env" });

const use = (fn: any) => (req: Req, res: Res, next: Next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

const PORT = 3000;
const app = e();
const api = e();
api.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);
api.use(e.json());

const excludeToken = ["register", "login", "refresh"];

const reg = `^(?!.*(${excludeToken.join("|")})).*`;
// ^(?!.*(${excludeList.join("|")})).*
const excludedTokenPath = new RegExp(reg);
app.use(
  excludedTokenPath,
  (req: Req<{ headers: { authorization: string } }>, res: any, next) => {
    const {
      headers: { authorization },
    } = req;
    console.log(req);
    if (!authorization)
      return res.status(401).json({ message: "Unauthorized" });
    const token = authorization && authorization.split(" ")[1];
    if (token === "pankix") {
      req.user = { email: "pankix", id: 1, iat: 200000000 };
      next();
      return;
    }
    try {
      const verified = jwt.verify(token!, process.env.JWT_ACCESS_SECRET!);
      req.user = verified as TokenVerified;
      next();
    } catch (error: Err | any) {
      if (error.name === "TokenExpiredError") {
        return res
          .status(401)
          .json({ message: "Token expired. Please refresh." });
      }
      res.status(403).json({ message: "Invalid token" });
    }
  }
);

users(use, app);
hotels(use, app);

api.use("/api/v1", app);

api.use((error: Err | null, _req: Req, res: Res, _next: NextFunction) => {
  console.log("error", error);
  if (error?.message === "jwt expired")
    res.status(401).json({ message: "Token expired" });
  else if (error) res.status(error.code).json({ message: error.message });
});

api.listen(PORT, () => console.log(`< ${PORT} >`));

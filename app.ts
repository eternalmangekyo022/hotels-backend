import cors from "cors";
import e from "express";
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
const createPathRegex = () => new RegExp(reg);
const excludedTokenPath = createPathRegex();
app.use(excludedTokenPath, (req: any, res: any, next) => {
  const {
    headers: { authorization },
  } = req;
  if (!authorization) return res.status(401).json({ message: "Unauthorized" });
  const token = authorization && authorization.split(" ")[1];

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
});

users(use, app);
hotels(use, app);

api.use("/api/v1", app);

api.use((error: Err | null, req: Req, res: Res, next: Next) => {
  console.log("error", error);
  if (error?.message === "jwt expired")
    res.status(401).json({ message: "Token e" });
  else if (error) res.status(error.code).json({ message: error.message });
});

api.listen(PORT, () => console.log(`< ${PORT} >`));

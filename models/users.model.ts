import crypto from "crypto";
import db from "./db";
import jwt from "jsonwebtoken";

export async function login(email: string, password: string) {
  const user = await db.selectOne<User>(
    "SELECT * FROM users WHERE email = ?",
    email
  );
  if (user) {
    const hashedPassword = crypto
      .createHash("md5")
      .update(password)
      .digest("hex");

    if (user.password === hashedPassword) return user;
    else throw { message: "Invalid password", code: 401 };
  } else throw { message: "User not found", code: 404 };
}

// |><|

export async function register(user: UserRegister) {
  const foundUser = await db.selectOne<User>(
    "SELECT * FROM users WHERE email = ?",
    user.email
  );
  if (foundUser) throw { message: "User already exists", code: 409 };
  const { insertId } = await db.insert("INSERT INTO users SET ?", user);
  return await db.selectOne("select * from users where id = ?", insertId);
}

export async function refresh(refreshToken: string): Promise<string> {
  try {
    const user = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as {
      email: string;
      id: number;
    };
    return jwt.sign(
      { email: user.email, id: user.id },
      process.env.JWT_ACCESS_SECRET!,
      { expiresIn: "15m" }
    );
  } catch (err) {
    throw { message: "Invalid refresh token", code: 401 };
  }
}

export async function deleteUser(id: number) {
  const user = await db.selectOne<User>("SELECT * FROM users WHERE id = ?", id);
  if (!user) throw { message: "User not found", code: 404 };
  await db.delete("DELETE FROM users WHERE id = ?", id);
  return { message: "User deleted successfully" };
}

export async function patchUser(usr: UserPut) {
  const { affectedRows } = await db.patch("update users SET ? where id = ?", [
    usr,
    usr.id,
  ]);
  if (affectedRows === 0) throw { message: "User not found", code: 404 };
}

export async function getUsers() {
  const res = await db.select("SELECT * FROM users limit 30");
  return res;
}

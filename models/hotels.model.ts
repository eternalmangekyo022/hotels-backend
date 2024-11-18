import db from "./db";

export async function getHotels() {
  const res = await db.select("SELECT * FROM hotels limit 30");
  return res;
}

import mysql from "mysql2";

const conn = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "root",
  database: "hotels",
});

/**
 * Executes a SQL query using a connection pool and returns a promise with the result.
 *
 * @template T - The expected type of the query result.
 * @param {string} q - The SQL query string to be executed.
 * @param {any} [val] - Optional values to be used in the query.
 * @returns {Promise<T>} A promise that resolves with the query result.
 */

const query = <T = any>(q: string, val?: any): Promise<T> => {
  return new Promise<T>((res, rej) => {
    conn.query(q, val, (err, q) => {
      if (err) rej(err);
      res(q as T);
    });
  });
};

export default {
  insert: async <T = {}>(
    q: string,
    val?: any
  ): Promise<T & { insertId: number }> => {
    if (!q.toLowerCase().includes("insert"))
      throw { message: 'Query did not include keyword "insert".' };
    return await query<T & { insertId: number }>(q, val);
  },
  select: async <T = any>(q: string, val?: any): Promise<T[]> => {
    if (!q.toLowerCase().includes("select"))
      throw { message: 'Query did not include keyword "select".' };
    return await query<T[]>(q, val);
  },

  selectOne: async <T = any>(q: string, val?: any): Promise<T | null> => {
    if (!q.toLowerCase().includes("select"))
      throw { message: 'Query did not include keyword "select".' };
    const result = await query<T[]>(q, val);
    return result.length ? result[0] : null;
  },
};

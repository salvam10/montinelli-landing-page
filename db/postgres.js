const dotenv = require("dotenv");
dotenv.config();
const Pool = require("pg").Pool;
/* const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
}); */

const pool = new Pool({
  connectionString: process.env.LOCAL_DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

module.exports = {
  //Exporto el método query de esta manera para poder realizar queries.
  query: (text, params, callback) => {
    return pool.query(text, params, callback);
  },
};

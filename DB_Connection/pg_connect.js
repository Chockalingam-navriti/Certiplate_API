const { Pool, Client } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

class DB_Connect {
    pool;
    constructor() {
        try {
            this.pool = new Pool({
                user: process.env.user,
                host: process.env.host,
                database: process.env.database,
                password: process.env.password,
                port: process.env.port,
                max: 1500
            });
        } catch (err) {
            console.log(err);
        }
    }
    Query_Function(queries, callback) {
        this.pool.query(queries, (err, res) => {
            callback(res.rows);
            this.pool.end();
        })
    }

}

module.exports = DB_Connect;
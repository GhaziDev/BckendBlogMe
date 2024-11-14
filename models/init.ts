import path from 'path'
import dotenv from 'dotenv'
import pg from 'pg'

dotenv.config({path:path.join(__dirname+'../.env')})


const Pool = {
    database:process.env.ENV == 'dev'?'blogme_copy':process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    host:'localhost',

    port: 5432,
    

    keepAlive: true,
    statement_timeout: 10000,      
    connectionTimeoutMillis: 100000000, 
    
}

const pool = new pg.Pool(Pool)

export default pool;


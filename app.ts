

import { Express } from "express"
import express from 'express'
import { BodyParser } from "body-parser"

import parser from 'body-parser'
import { SessionOptions } from "express-session"
import { Session } from "express-session"
import session from "express-session"
import cors from 'cors'
import { CorsOptions } from "cors"
import {pool} from './routes/routes'

import {router} from './routes/routes'
const pgSessionStore = require('connect-pg-simple')(session);


const app:Express = express()
const port = 3000

const corsConfig:CorsOptions = {
  methods:'*',
  origin:['http://127.0.0.1:8000','http://localhost:8000'],
  credentials:true
}


app.set('trust proxy', 1) // trust first proxy




app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})


app.use(cors(corsConfig))

app.use(session(
  {
  store: new pgSessionStore({
    pool:pool,
    tableName:'session',
    createTableIfMissing:true
    
  }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  cookie: { maxAge: 365 * 24 * 60 * 60 * 1000,httpOnly: true ,secure:false},
  saveUninitialized: false,
}))




app.use(parser.urlencoded({extended:false}))
app.use(parser.json())
app.use('/api',router)
//app.use(proxy('http://127.0.0.1:3000'))






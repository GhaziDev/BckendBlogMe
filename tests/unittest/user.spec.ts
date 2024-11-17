import path from "path";
import dotenv from "dotenv";
import express from "express";
import request from "supertest";
import { expect, test, describe, beforeAll, afterAll } from "vitest";
import BlogController from "../../controllers/blogController";
import AuthController from "../../controllers/authController";
import FollowListController from "../../controllers/followlistController";
import auth from "../../middlewares/auth";
import pool from "../../models/init";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
dotenv.config({ path: path.join(__dirname, "../../.env") });

const app = express();
const pgSessionStore = connectPgSimple(session);


app.use(session(

    {


    store: new pgSessionStore({
      pool:pool,
      tableName:'session',
      createTableIfMissing:true

      
    }),
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: true,
  }))


beforeAll(async () => {
 

  
  
  const parser = require('body-parser')
  app.use(parser.urlencoded({extended:false}))
  app.use(parser.json())
  app.post("/signup", AuthController.signup);
  app.post('/checkusername',AuthController.checkUsername);
  app.post('/checkpassword',AuthController.checkPassword)
  app.post('/login',AuthController.login)
  app.post('/logout',AuthController.logout)
  app.get('/followers/:userId',auth, FollowListController.followers)
  app.get('/followees/:userId',auth,FollowListController.followees)
  app.post('/follow/:userId',auth,FollowListController.follow)


})

describe('Sign up operations',async function (){
  test('Should make an account for a new user successfully',async function (){
    const res = await request(app).post('/signup',AuthController.signup).send({

      firstname:'lakey',lastname:'lakey',username:'ghazi__',password:'Newpass1234@',email:'newemail@gmail.com'
    }).timeout(20000)


    
    console.log(res.body)
    console.log('hello')
    expect(res.body.message).to.equal('Account successfully created!')

  },20000)
  test('Should make an account, with faulty username',async function (){
    const res = await request(app).post('/signup',AuthController.signup).send({
      username:'ghazi',password:'Newpass1234',email:'somsasajsekssemvjassil@gmail.com'
    })
    expect(res.body.message).to.equal('Username should be 6 characters or longer')


  },20000)

  test('Should make an account, with already existing username',async function (){
    const res = await request(app).post('/signup',AuthController.signup).send({
      username:'ghazi__',password:'Newpass1234',email:'somenewemail@gmail.com'
    })
    expect(res.body.message).to.equal('Username already exists in database')
  })

  test('Should make an account, with wrong password criteria',async function (){
    const res =  await request(app).post('/signup',AuthController.signup).send({
      username:'ghazi___',password:'somepass',email:'somenessswemail@gmail.com'
    })
    expect(res.body.message).to.equal('Password criteria failed')
  })

  test('Should make an account, with already existing email',async function(){
    const res =  await request(app).post('/signup',AuthController.signup).send({
      username:'ghazi11222',password:'Newpass1234',email:'newemail@gmail.com'
    })
    expect(res.body.message).to.equal('Email already exists in database')

  })

  test('Should make an account, with already exisiting username',async function (){
    const res = await request(app).post('/signup',AuthController.signup).send({
      username:'ghazi__',password:'Newpass1234',email:'newemssail@gmail.com'
    })
    expect(res.body.message).to.equal('Username already exists in database')

  })



  })








describe('Login tests operations',async function(){
  test('Should Successfully log in',async function(){
    const res = await request(app).post('/login',AuthController.login).send({email:'newemail@gmail.com',password:"Ghazi@932000"})

    expect(res.statusCode).to.equal(200)

  })


  test('Should login then logout',async function(){
    const res = await request(app).post('/login',AuthController.login).send({email:'newemail@gmail.com',password:"Ghazi@932000"})

    expect(res.statusCode).to.equal(200)
    const res1 = await request(app).post('/logout',auth,AuthController.logout)
   
    expect(res1.statusCode).toBe(200)
    expect(res1.body.message).to.equal('You have been logged out!')

  })

  

  
  test('Should login with wrong password',async function(){
    const res = await request(app).post('/login',AuthController.login).send({email:'newemail@gmail.com',password:"Ghazi@9322000"})
    expect(res.statusCode).toBe(400)
    expect(res.body.message).to.equal('Wrong password')
  })

  test('Should login with wrong email',async function(){
    const res = await request(app).post('/login',AuthController.login).send({email:'nennaawemail@gmail.com',password:"Ghazi@932000"})
    expect(res.statusCode).toBe(400)
    expect(res.body.message).to.equal('Email does not exists in database')


  })


  
})


















afterAll(async function (){
  // delete all accounts created during tests
},20000)

import Auth from '../models/authModel'

//const nodemailer = require('nodemailer')

import {createTransport} from 'nodemailer'
import { ControllerObject } from '../typing'

const mailer = createTransport({
    host:'smtp.office365.com',
    port:587,
    secure:false, // set port to 465 on true (true only on https)
    auth:{
        user:process.env.HOST_EMAIL,
        pass :process.env.HOST_PASSWORD
    }
})




const AuthController:ControllerObject = {}


AuthController.signup = async function(req,res){

    try{

    const {success,data,message} = await Auth.signup(req.body)
  
  
    if(!success){
        
        return res.status(400).json({data:data})
    }
   
    await mailer.sendMail({
        to:req.body.email,
        subject:'BlogMe Email Verification',
        text:`Hello, in order to be able to post blogs and stories, please enter the following token to activate your account in our website: \n\n  ${data}`
    })

    return res.status(200).json({message:message})
}
catch(e){
    return res.status(500).json({error:e.message})
}



}


AuthController.isAuthenticated = async function(req,res){
    console.log('this is /isauthenticated controller the next line is a logging for session cookie')
    console.log(req.session)
    console.log(req.session.sessionID)
    console.log(req.session.userId)
    if(req.session?.sessionID){
        console.log(req.session)
        return res.status(200).json({success:true,message:'You are already logged in',data:null})

    }
    return res.status(401).json({success:false,message:'You are not logged in yet',data:null})

}

AuthController.login = async function (req,res){

    try{
    const {data,message,success} = await Auth.login(req.body)
    if(success){
    console.log('this is /login route after login button is pressed, which means below the sessionId should be defined')
    req.session.sessionID = data.sessionId
    req.session.userId = data.userId



    req.session.save((err) => {
        if (err) {
            console.error('Session save error:', err);
            return res.status(500).json({ message: 'Session save error' });
        }

   
        console.log('Session saved:', req.session.sessionID);
        //res.status(200).json({ message: `User with ID ${data} has logged in successfully` });
    });
    console.log(req.session.sessionID)
    console.log(req.session.userId)

    return res.status(200).json({message:`user with ID ${data} has logged in successfully`})
    }
    return res.status(400).json({message:message})

    }

    catch(e){
        return res.status(400).json({error:e.message})
    }
}

AuthController.logout = function (req,res){
    if(req.session?.sessionID){
        req.session.sessionID = null
        req.session.userId = null

        req.session.save((err) => {
            if (err) {
                console.error('Session save error:', err);
                return res.status(500).json({ message: 'Session save error' });
            }
    
       
            console.log('you logged out!')
            //res.status(200).json({ message: `User with ID ${data} has logged in successfully` });
        });
        return res.status(200).json({message:"you have been logged out!"})
    }
    return res.status(401).json({error:"you are not logged in to begin with"})
}

AuthController.checkUsername = async function (req,res){
    try{
    const {success,message,data} = await Auth.checkUsername(req.body)
    if(!success){
        return res.status(400).json({error:message})

    }


    if(data.length<6){
        return res.status(400).json({error:'username must be at least have 6 characters'})

    }
    
    return res.json({message:message}).status(200)

    }
    catch(err){
        return res.json({error:err.message}).status(400)
    }

   

}



AuthController.checkPassword = function (req,res){
    
    
    const {password} = req.body
  





}


AuthController.isActivated = async function(req,res){
    const {message,success,data} = Auth.isActivated(req.session)
    if(success){
    return res.json({message:`${message}`}).status(200)
    }

}

AuthController.activate = async function(req,res){
    const tokenInserted = await Auth.activate(req.body, req.session)
    return tokenInserted?res.json({message:"Your account has been activated!"}).status(200):
    res.json({error:"Token is wrong"}).status(400)
}

export default AuthController

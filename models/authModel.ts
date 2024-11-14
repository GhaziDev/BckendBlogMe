
const dotenv = require('dotenv').config({path:'../.env'})
const bcrypt = require('bcryptjs')
const pool = require('./init')
const {v4:uuid} = require('uuid')

import ResponseObject, {ControllerObject} from "../typing"



const Auth:ControllerObject = {}





Auth.signup = async function ({email,username,password,firstname,lastname,bio,profilelogo}:any):Promise<ResponseObject> {
    const emailInDb = email? await pool.query('SELECT email FROM _user WHERE email = $1',[email]):undefined
    const userInDb = username? await pool.query('SELECT _username from _user WHERE _username = $1',[username]):undefined
    const symbols = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/
    const numInPass = password?/\d/.test(password):undefined
    const symInPass = password?symbols.test(password):undefined
    const capInPass =  password?/[A-Z]/.test(password):undefined
    const lowerInPass = password?/[a-z]/.test(password):undefined
    const error = {username: new Array<string>,password: new Array<string>,email:new Array<string>}

    if(password?.length<8){
        
        error.password.push('your password need to be at least 8 characters long')
    }
    if(!numInPass){
        
        error.password.push('Your password must have one numerical charracter at least')
    }
    if(!symInPass){
        error.password.push('Your password must contain one special character at least')
    }

    if(!capInPass){
        error.password.push('Your password must contain one capital letter at least')
    }
    if(!lowerInPass){
        error.password.push("Your password must contain one lower letter at least")
    }

    if(emailInDb?.rows[0]){
       error.email.push('Email already exists in database')

    }
    if(userInDb?.rows[0]){
        error.username.push('Username already exists in database')
    }
    console.log(username)
    
    if(username?.length<6){
        
        error.username.push('Username should be 6 characters or longer')
    }

    if(error.username.length || error.password.length || error.email.length){
        return {success:false,message:'Some criteria failed.',data:error}
    }



    //username configuration

    //password configuration

    else{

        const hashedPass = await bcrypt.hash(password,10)
        const token = uuid()
        const userId = uuid()
        await pool.query('INSERT INTO _user (id,email,_username,password,activated,token,firstname,lastname,bio,profilelogo) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)',[userId,email,username,hashedPass,false,token,firstname,lastname,bio,profilelogo])
        return {success:true,message:'Account successfully created!',data:token}
    }


}


Auth.login = async function ({email,password}:any){
    const checkEmail = await pool.query('SELECT email from _user WHERE email = $1',[email])
    

    if(checkEmail.rows[0]){
        const hashedPassword = await pool.query('SELECT password from _user WHERE email = $1',[email])

        
    
        const compare = await bcrypt.compare(password,hashedPassword.rows[0].password)
        if(compare){
            const userId = await pool.query('SELECT * FROM _user WHERE email = $1',[email])
            return {message:'',data:{'sessionId':uuid(),'userId':userId.rows[0].id},success:true}

        }
        else{
            return {message:'Wrong password',data:null, success:false}
        }
   
    }

    else{
        return {message:'Email does not exists in database',data:null,success:false}
    }



}

Auth.checkUsername = async function({username}:any){
    const usernameInDb = await pool.query('SELECT _username FROM _user WHERE _username = $1',[username])
    if(usernameInDb.rows[0]){
        return {success:false,message:'Username already exists in database',data:null}
    }
    return {success:true,message:'Username available!',data:username}


}

/**
 * 
 * @param {uuid} sessionId 
 * @returns {boolean}
 */
Auth.isActivated = async function ({userId}:any){
    const isActivated = await pool.query('SELECT activated FROM _user WHERE id = $1',[userId])
    return {success:true,data:isActivated.rows[0],message:`Your account activation status is : ${isActivated}`}
}

Auth.activate = async function({token}:any,{userId}:any){

    const userToken = await pool.query('SELECT token from _user where id = $1',[userId])
    if(userToken.rows[0].token == token){
        await pool.query('UPDATE _user SET activated = TRUE WHERE id = $1',[userId])
        return {success:true,message:'Account activated!',data:null}
    }
    return {success:false,message:'Wrong Token',data:null}

    
}

export default Auth






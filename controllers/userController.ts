import User from "../models/userModel"
import { ControllerObject } from "../typing"

const UserController:ControllerObject = {}


UserController.get = async function (req,res){
    console.log('try')
    

    try{
        const userInfo = await User.get(req.params)
        console.log(req.params)
  
        if(userInfo.success){
            console.log(userInfo.data)

            return res.status(200).json({data:userInfo.data})
        }

        return res.status(401).json({message:userInfo.message})

    }
    catch(err){
        console.log(err)

        return res.status(500).json({error:err.message})
    }
}

UserController.editProfile = async function (req,res){
    
    try{
        const editData = await User.editProfile(req.params,req.body, req.session,req.file)
        if(editData.success){
        return res.status(200).json({message:editData.message})
        }
        return res.status(400).json({message:editData.message})
    }

    catch(err){
        return res.status(500).json({message:editData.message})
    }

}

UserController.deleteProfile = async function (req,res){
    try{
        if(success){
        const deletedData = await User.deleteProfile(req.params,req.session)
        return res.json(200).json({message:deletedData.message})
        }
        return res.json(400).json({message:deleteData.message})

    }
    catch(err){
        return res.status(500).json({message:err.message})
    }
}

export default UserController
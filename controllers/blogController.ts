import path from 'path';
import dotenv from 'dotenv';
import Blog from '../models/blogModel.js';
import { ControllerObject } from '../typing.js';



const BlogController:ControllerObject = {}

BlogController.getAll = async function (req,res){
    const {data,message} = await Blog.getAll(req.session)
    try{

        return res.status(200).json({data:data})
    }
    catch(err){
        return res.status(500).json({error:err.message})
    }


}

BlogController.get = async function(req,res){

    const {data,message} = await Blog.get(req.params)
    try{
        return res.status(200).json({data:data})
    }
    catch(err){
        console.log(err.message)

        return res.status(500).json({error:err.message})
    }
}

BlogController.post = async function (req,res){
    
    try{
        await Blog.post(req.body,req.file,req.session)
        return res.status(200).json({message:"a new blog has been created"})
    }
    catch(err){
        return res.status(400).json({error:err.message})
    }

}

BlogController.edit = async function (req,res){
    
    try{
        await Blog.edit(req.body,req.session)
        return res.json({message:`Blog with id ${req.body.id} has been edited`}).status(200)
    }
    catch(err){
        return res.json({error:err.message}).status(400)
    }
}

BlogController.delete = async function (req,res){
    try{
        await Blog.delete(req.body,req.session)
        return res.json({message:`Blog with id ${req.body.id} has been deleted`}).status(200)
    }
    catch(err){
        return res.json({error:err.message}).status(400)
    }
}

BlogController.getLikes = async function(req,res){
    try{
        const [likes,likesNum] = (await Blog.getLikes(req.params)).data
        
        return res.json({likes:likes,likesNum:likesNum})
    }

    catch(err){
        return res.json({error:err.message}).status(500)
    }
}

BlogController.postLike = async function(req,res){
    try{
        await Blog.postLike(req.params,req.session)
        return res.json({message:'blog has been liked'}).status(200)
    }
    catch(err){
        return res.json({error:err.message}).status(500)
    }
}

BlogController.unlike = async function (req,res){
    try{
        await Blog.unlike(req.params,req.session)
        return res.json({message:'blog has been unliked'}).status(200)
    }
    catch(err){
        return res.json({error:err.message}).status(500)
    }
}

BlogController.getComments = async function(req, res){
    try{
        const data = await Blog.getComments(req.params)
        return res.status(200).json({message:data.message,data:data.data,success:data.success})
    }
    catch(err){
        console.log(err)
        return res.status(500).json({error:err.message})
    }
}

BlogController.postComment = async function (req,res){
    try{
        await Blog.postComment(req.params,req.body,req.session)
        return res.json({message:'Comment has been posted!'}).status(200)
    }
    catch(err){
        return res.json({error:err.message}).status(500)
    }
}

BlogController.editComment = async function (req,res){
    try{
        await Blog.editComment(req.params,req.body,req.session)
        return res.json({message:'Comment has been edited!'}).status(200)
    }
    catch(err){
        return res.json({error:err.message}).status(500)
    }
}

BlogController.deleteComment = async function(req, res) {
    try{
        await Blog.deleteComment(req.params,req.session)
        return res.json({message:'Comment has been deleted!'}).status(200)
    }
    catch(err){
        return res.json({error:err.message}).status(500)
    }
}

BlogController.fget = async function (req,res){
    try{
        const getData = await Blog.fget(req.session)
        return res.json({data:getData}).status(200)
    }
    catch(err){
        return res.json({error:err.message}).status(500)
    }
}


export default BlogController




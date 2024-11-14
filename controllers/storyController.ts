import { ControllerObject } from "../typing"

import Story from "../models/storyModel"

const StoryController:ControllerObject = {}

StoryController.get = async function(req,res){
    const getData = await Story.get(req.id)
    try{
        return res.json({data:getData.rows}).status(200)
    }
    catch(err){
        return res.json({erro:err.message}).status(500)
    }
}

StoryController.post = async function (req,res){
    
    try{
        await Story.post(req.body)
        return res.json({message:"a new blog has been created"}).status(200)
    }
    catch(err){
        return res.json({error:err.message}).status(400)
    }

}

StoryController.delete = async function (req,res){
    try{
        await Story.delete(req.body,req.session)
        return res.json({message:`Story with id ${req.body.id} has been deleted`}).status(200)
    }
    catch(err){
        return res.json({error:err.message}).status(400)
    }
}

StoryController.getLikes = async function(req,res){
    try{
        const [likes,likesNum] = await Story.getLikes(req.body)
        return res.json({likes:likes,likesNum:likesNum})
    }

    catch(err){
        return res.json({error:err.message}).status(500)
    }
}

StoryController.postLike = async function(req,res){
    try{
        await Story.postLike(req.body)
        return res.json({message:'blog has been liked'}).status(200)
    }
    catch(err){
        return res.json({error:err.message}).status(500)
    }
}

StoryController.unlike = async function (req,res){
    try{
        await Story.unlike(req.body,req.session)
        return res.json({message:'blog has been unliked'}).status(200)
    }
    catch(err){
        return res.json({error:err.message}).status(500)
    }
}

StoryController.getComments = async function(req, res){
    try{
        const data = await Story.getComments(req.body)
        return res.json({message:data.rows}).status(200)
    }
    catch(err){
        return res.json({error:err.message}).status(500)
    }
}

StoryController.postComment = async function (req,res){
    try{
        await Story.postComment(req.body)
        return res.json({message:'Comment has been posted!'}).status(200)
    }
    catch(err){
        return res.json({error:err.message}).status(500)
    }
}

StoryController.editComment = async function (req,res){
    try{
        await Story.editComment(req.body,req.session)
        return res.json({message:'Comment has been edited!'}).status(200)
    }
    catch(err){
        return res.json({error:err.message}).status(500)
    }
}

StoryController.deleteComment = async function(req, res) {
    try{
        await Story.deleteComment(req.body,req.session)
        return res.json({message:'Comment has been deleted!'}).status(200)
    }
    catch(err){
        return res.json({error:err.message}).status(500)
    }
}


export default StoryController




import FollowList from "../models/followlistModel"

const FollowListController = {}


FollowListController.followers = async function(req,res){
    const getFollowers = await FollowList.followers(req.params)
    try{
        return res.json({data:getFollowers.rows}).status(200)
    }
    catch(err){
        return res.json({error:err.message}).status(500)
    }
}

FollowListController.followees = async function(req,res){
    const getFollowees = await FollowList.followees(req.params)
    try{
        
        return res.json({data:getFollowees.rows}).status(200)

    }
    catch(err){
        return res.json({error:err.message}).status(500)
    }
}

FollowListController.follow = async function(req,res){
    try{
        await FollowList.follow(req.params,req.session)
        return res.json({message:'User added as a followee to followlist'}).status(200)


    }

    catch(err){
        return res.json({error:err.message}).status(500)

    }
     
}


FollowListController.unfollow = async function(req,res){
    try{
        const unfollowFunc = await FollowList.unfollow(req.param,req.session)
        if(req.params.list =='followees'){
            res.json({message:'Unfollowed successfully'}).status(200)
        }
        else if(req.params.list == 'followers'){
            res.json({message:"User removed from followers list"}).status(200)
        }
    }
    catch(err){
        res.json({error:err.message}).status(500)
    }
}


export default FollowListController
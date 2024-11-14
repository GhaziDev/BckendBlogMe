import { ControllerObject } from "../typing"
import pool from "./init"

const FollowList:ControllerObject = {}

FollowList.followers = async function({followee}){
    const getFollowers = await pool.query('SELECT followerId from followlist WHERE followeeid = $1',[followee])
    return getFollowers
}

FollowList.followees = async function({follower}){
    const getFollowees = await pool.query('SELECT followeeId from followlist WHERE followerId = $1',[follower])
    return getFollowees
}
FollowList.follow = async function({user},{userId}){
    const addUserToFollowList = await pool.query('INSERT into followlist (followerid,followeeid) VALUES($1,$2)',[userId,user])
    return addUserToFollowList

}


FollowList.unfollow = async function({user,list},{userId}){
    if(list == 'followees'){
        const fetchFollowers= await pool.query('DELETE FROM followlist WHERE followeeid = $1 AND followerid = $2',[user,userId])
        return fetchFollowers
        }
    else{
        const fetchFollowers = await pool.query('DELETE FROM followlist WHERE followeeid =$1 and followeid',[user])
        return fetchFollowers

    }
}

export default FollowList
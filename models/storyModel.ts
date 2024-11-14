import pool from './init.js';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { v4 as uuid } from 'uuid';
import fs from 'fs';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { ControllerObject } from '../typing.js';

const Story:ControllerObject = {}


Story.get = async function({userId}){
    const stories = await pool.query('SELECT s.* FROM story s JOIN follower f on f._user = $1 WHERE s._user = ANY(f.followings)',[userId])
    return stories

}

Story.post = async function({description,path,filename}){
    const storyId = uuid()


    const uploadFile = async (filePath,fileName, bucketName) => {
        const fileContent = fs.readFileSync(filePath);

      
        const params = {

          Bucket: bucketName,
          Key: fileName,
          Body: fileContent,
          ACL: 'public-read'  // This makes the object public
        };
      
        await s3.send(new PutObjectCommand(params), (err, data) => {
          if (err) {
            console.error('Error uploading file:', err);
          } else {
            console.log(`File uploaded successfully. ${data.Location}`);
          }
        });
      };


    try{
    uploadFile(path,filename,process.env.AWS_BUCKET_NAME)
    const result = await pool.query('INSERT INTO blog (id, image,description,_user) VALUES($1,$2,$3,$4)',[blogId,`https://myblogme.s3-ap-southeast-2.amazonaws.com/${req.file.filename}/`,description,req.session.sessionId])
    return result
    }
    catch(err){
        return new Error(err.message)
    }

    //https://myblogme.s3-ap-southeast-2.amazonaws.com/filename


}



Story.delete = async function({id},{userId}){
    const fetchUser = await pool.query('SELECT _user FROM story WHERE id = $1',[id])
    if(fetchUser.rows[0]._user==userId){
        const del = await pool.query('DELETE FROM story WHERE id = $1',[id])
        return del

    }
    return new Error('You are not the owner of this story')


}

Story.getLikes = async function({id}){
    const fetchLikes = await pool.query('SELECT u._username FROM _user u JOIN story_likes sl ON sl.story = $1 WHERE sl.userid = u._id  ',[id])
    const fetchLikesNums = await pool.query('SELECT COUNT(userid) FROM story_likes WHERE blog = $1',[id])
    return [fetchLikes.rows,fetchLikesNums.rows[0]]

}

Story.postLike = async function({id},{userId}){
    const newId = uuid()
    const fetchStory  =await pool.query('INSERT INTO story_likes (id,userid,story) VALUES($1,$2,$3)',[newId,userId,id])
    return fetchStory
}

Story.unlike = async function({id},{userId}){
    const checkSameUser = await pool.query('SELECT _user FROM story WHERE id = $1',[id])
    if(checkSameUser.rows[0].id == userId){
        const delike = await pool.query('DELETE from story_likes WHERE id=$1',[id])
        return delike
    }
    return new Error('Invalid User to unlike the story')


}


Story.getComments = async function ({id}){
    const comments = await pool.query('SELECT * from story_comments WHERE story = $1',[id])
    return comments
}


Story.postComment = async function({id,description},{userId}){
    const newId = uuid()
    const newC = await pool.query('INSERT INTO story_comments (id,story,description,_user) VALUES($1,$2,$3,$4)',[newId,id,description,userId])
    return newC
}

Story.editComment = async function ({commentId,description},{userId}){
    const verifyUser = await pool.query('SELECT _user FROM story_comments WHERE id = $1',{commentId})
    if(verifyUser == userId){
        const edit = await pool.query('UPDATE story_comments SET description =$1 WHERE id = $2',[description,commentId])
        return edit

    }
    return new Error('User does not own the comment to edit it')

    
}

Story.deleteComment = async function ({commentId}){
    //Verify if the user using deleting the comment is the same as the one who created it.
    const verifyUser = await pool.query('SELECT _user FROM story_comments WHERE id = $1',{commentId})
    if(verifyUser == sessionId){
        const del = await pool.query('DELETE from story_comments WHERE id = ',[commentId])
        return del

    }
    return new Error('User does not own the comment to delete it')

}

export default Story




import path from 'path';
import pool from './init.js';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { v4 as uuid } from 'uuid';
import fs from 'fs';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import ResponseObject, { ControllerObject} from '../typing.js';
dotenv.config({ path: path.join(__dirname, '../.env') });

const s3 = new S3Client({ region: 'ap-southeast-2' });


const Blog:ControllerObject = {}

Blog.getAll = async function({userId}:any){
    let story = null
    if(userId){
        story = await pool.query('SELECT s.created_at, s.image, s.description, u._username FROM story s JOIN _user u ON u.id = s._user JOIN followlist f ON f.followerid = $1 WHERE s._user = f.followeeid',[userId])
    }
    const data = await pool.query('SELECT bl.id, bl.title, bl.image, bl.tags, bl.created_at, u._username FROM blog bl, _user u  WHERE u.id = bl._user')

    return {message:null,data:[data.rows,!story?.rows?null:story.rows], success:true}
}


Blog.get = async function({id}:any){
    const data = await pool.query('SELECT bl.id, bl.title, bl.image, bl.tags, bl.created_at, bl.description, u._username FROM blog bl, _user u WHERE bl.id = $1 AND u.id = bl._user',[id])

    return {message:null,data:data.rows[0],success:true}

}

Blog.fget = async function({userId}:any):Promise<ResponseObject>{
    const blogs = await pool.query('SELECT b.* FROM blog b JOIN followlist f ON f.followerid = $1 WHERE b._user = ANY(f.followeeid)',[userId])
    return {message:null, data:blogs.rows, success:true}
}

Blog.post = async function({title,tags, description}:any,{path,filename}:any,{userId}:any){
    const blogId = uuid()


    const uploadFile = async (filePath:string,fileName:string, bucketName:string) => {
        try{
        const fileContent = fs.readFileSync(filePath);

      
        const params = {

          Bucket: bucketName,
          Key: fileName,
          Body: fileContent,
          ACL: 'public-read'  // This makes the object public
        };
      
        s3.send(new PutObjectCommand(params), (err, data) => {
          if (err) {
            console.error('Error uploading file:', err);
          } else {
            console.log(`File uploaded successfully.`);
          }
        });
    }
    catch(err:any){

        throw new Error(err.message)
    }
      };


    try{
    uploadFile(path,filename,process.env.AWS_BUCKET_NAME)
    const result = await pool.query('INSERT INTO blog (id, title, image,description,tags,_user) VALUES($1,$2,$3,$4,$5,$6)',[blogId,title,`https://myblogme.s3.ap-southeast-2.amazonaws.com/${filename}`,description,tags,userId])
    return {message:'Blog has been successfully created',success:true, data:null}
    }
    catch(err){
        console.log(err.message)
        return {success:false, data:null, message:err.message}
    }

    //https://myblogme.s3-ap-southeast-2.amazonaws.com/filename


}

Blog.edit = async function ({id,description},{userId}){
    const fetchUser = await pool.query('SELECT _user FROM blog WHERE id = $1',[id])
    if(fetchUser.rows[0]._user==userId){
        const update = await pool.query('UPDATE blog SET description = $1 WHERE id=$2',[description,id])
        return {message:'Blog updated successfully', success:true, data:null}

    }
    return {message:'Blog is not owned by you', success:false, data:null}



}

Blog.delete = async function({id},{userId}){
    const fetchUser = await pool.query('SELECT _user FROM blog WHERE id = $1',[id])
    if(fetchUser.rows[0]._user==userId){
        const del = await pool.query('DELETE FROM blog WHERE id = $1',[id])
        return {message:'Blog deleted successfully',success:true,data:null}

    }
    return {message:'Blog is not owned by you', success:false, data:null}


}

Blog.getLikes = async function({id}){
    const fetchLikes = await pool.query('SELECT u._username FROM _user u JOIN blog_likes bl ON bl.blog = $1 WHERE bl.userid = u._id  ',[id])
    const fetchLikesNums = await pool.query('SELECT COUNT(userid) FROM blog_likes WHERE blog = $1',[id])
    return {message:null,data:[fetchLikes.rows,fetchLikesNums.rows[0]],success:true}

}

Blog.postLike = async function({id},{userId}){
    const newId = uuid()
    const fetchBlog  =await pool.query('INSERT INTO blog_likes (id,userid,blog) VALUES($1,$2,$3)',[newId,userId,id])
    return {message:'Liked the blog successfully',success:true,data:null}
}

Blog.unlike = async function({id},{userId}){
    const checkSameUser = await pool.query('SELECT _user FROM blog WHERE id = $1',[id])
    if(checkSameUser.rows[0].id == userId){
        const delike = await pool.query('DELETE from blog_likes WHERE id=$1',[id])
        return {message:'Un-Liked the blog successfully',success:true,data:null}
    }
    return {message:'You did not Like this blog to begin with',success:false,data:null}


}


Blog.getComments = async function ({id}){
    const comments = await pool.query('SELECT c.id, c.description, c.created_at, u._username from blog_comments c, _user u  WHERE blog = $1 AND u.id = c._user',[id])
    console.log(comments)
    
    
    return {message:null,data:comments.rows,success:true}
}

Blog.postComment = async function({id},{description},{userId}){
    console.log('this is req.session.userId')
    console.log(userId)
    const newId = uuid()
    const newC = await pool.query('INSERT INTO blog_comments (id,blog,description,_user) VALUES($1,$2,$3,$4)',[newId,id,description,userId])
    return {data:null, success:true,message:'Comment added successfully'}
}

Blog.editComment = async function ({commentId},{description},{userId}){
    const verifyUser = await pool.query('SELECT _user FROM blog_comments WHERE id = $1',{commentId})
    if(verifyUser == userId){
        const edit = await pool.query('UPDATE blog_comments SET description =$1 WHERE id = $2',[description,commentId])
        return {data:null, success:true,message:'Comment edited successfully'}

    }
    return {data:null, success:true,message:'You dont own this comment to edit it'}

    
}

Blog.deleteComment = async function ({commentId},{userId}){
    //Verify if the user using deleting the comment is the same as the one who created it.
    const verifyUser = await pool.query('SELECT _user FROM blog_comments WHERE id = $1',{commentId})
    if(verifyUser == sessionId){
        const del = await pool.query('DELETE from blog_comments WHERE id = ',[commentId])
        return {data:null, success:true,message:'Comment deleted successfully'}

    }
    return {data:null, success:true,message:'You dont own this comment to delete it.'}
    

}



export default Blog


import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import pool from './init.js';
import { v4 as uuid } from 'uuid';
import { ControllerObject } from '../typing.js';

dotenv.config({ path: '../.env' });


const User:ControllerObject = {}

User.get = async function ({username}){
    try{
    const fetchUserData = await pool.query('SELECT firstname, lastname, _username, bio, profilelogo FROM _user WHERE _username = $1',[username])
    const fetchUserBlogs = await pool.query('SELECT bl.id, bl.title, bl.image, bl.tags, bl.created_at, bl.description, bl._user FROM blog bl, _user u WHERE u._username = $1',[username])
    const fetchUserStories = await pool.query('SELECT st.id, st.description, st.image, st.created_at, st._user FROM story st, _user u WHERE u._username = $1',[username])
    const fetchUserFollowers = await pool.query('SELECT u._username FROM _user u JOIN followlist f ON f.followerid = u.id WHERE f.followeeid = (SELECT id FROM _user WHERE _username = $1)',[username])
    const fetchUserFollowees = await pool.query('SELECT u._username FROM _user u JOIN followlist f ON f.followeeid = u.id WHERE f.followerid = (SELECT id FROM _user WHERE _username = $1)',[username])
   // count followers and followee numbers on frontend.


    return {success:true, data:[fetchUserData.rows[0], fetchUserBlogs.rows, fetchUserStories.rows, fetchUserFollowers.rows, fetchUserFollowees.rows],message:'User data has been fetched successfully'}
    }



    catch(e){
        console.log(e)
        return {success:false, data:null, message: e.message}
    }
}


User.editProfile = async function({id},{username, bio, profilelogo, firstname, lastname},{userId},{filename,path}){
    if(userId!==id ){
        return {success:false, message: 'You are not authorized to edit this profile',data:null}
    }

    try{

        if(profilelogo){

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
                console.log(`File uploaded successfully. ${data.Location}`);
              }
            });

            uploadFile(path,filename,process.env.AWS_BUCKET_NAME)

            await pool.query('UPDATE _user SET profilelogo = $1 WHERE id = $2',[`https://myblogme.s3.ap-southeast-2.amazonaws.com/${filename}`,id])

        }
       
        
        await pool.query('UPDATE _user SET _username = $1, bio = $2, firstname = $3, lastname = $4, WHERE id = $5',[username,bio,firstname,lastname,id])
        return {success:true, message:'Profile has been updated successfully',data:null}
    }

    catch(e){
        return {success:false, message:e.message,data:null}
    }
}

User.deleteProfile = async function ({id},{userId}){
    const pullUsername = await pool.query('SELECT _username FROM _user WHERE id = $1',[id])

    try{

    if(id == userId){
        await pool.query('DELETE FROM _user WHERE id = $1',[id])
        return {success:false, message:'Your profile has been deleted successfully',data:null}

    }
    return {success:false, message:'Username does not match',data:null}
}
catch(e){
    return {success:false, message:e.message,data:null}
}

}  

export default User


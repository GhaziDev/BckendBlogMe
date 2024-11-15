import express from 'express';
import dotenv from 'dotenv';
import multer from 'multer';

import auth from '../middlewares/auth';
import BlogController from '../controllers/blogController.js';
import AuthController from '../controllers/authController.js';
import StoryController from '../controllers/storyController.js';
import FollowListController from '../controllers/followlistController.js';
import pool from '../models/init.js';
import UserController from '../controllers/userController.js';

dotenv.config();


const storage = multer.diskStorage({
    destination: (req,file,cb)=>{
        cb(null,'static')
    },
    filename: (req,file,cb)=>{
        const uniqueSuffix = Date.now()+Math.round(Math.random() * 1E9)
        cb(null,uniqueSuffix+'-'+file.originalname)
    }
})

const upload = multer({storage:storage})
dotenv.config()


const router = express.Router()




//first route here


//route to fetch all blogs

router.get('/',BlogController.getAll)

router.get('/blog/:id',BlogController.get)


//routes for user sign up.

router.post('/checkusername',AuthController.checkUsername)

router.post('/checkpassword',AuthController.checkPassword)


router.get('/isauthenticated',AuthController.isAuthenticated)

router.post('/signup',AuthController.signup)

// show notification if activated entry in db is false, otherwise don't show notification.TY

router.get('/isactivated',auth, AuthController.isActivated)


router.post('/activate',auth,AuthController.activate)

// add an auth middleware here
router.post('/login',AuthController.login)

router.post('/logout',auth,AuthController.logout)

// stories and blogs here

//include the auth middleware function here
router.get('/stories',auth,StoryController.get)


// a blog routes for users you are following.
//include auth middleware later
router.get('/fblogs',auth, BlogController.fget)


//making stories and blogs

//include auth middleware
router.post('/makeblog',auth,upload.single('img'),BlogController.post)



router.post('/makestory',auth,upload.single('img'),StoryController.post)


// for editing/deleting blogs and stories.

// note that stories are short and not meant to be edited.


router.put('/blog/:id',auth,BlogController.edit)

router.delete('/blog/:id',auth,BlogController.delete)


router.delete('/story/:id',auth,StoryController.delete)

// following accounts routes

//considering that 1 user can have 0,1 or many followers (other users), and vice versa, then,
// there is a many-to-many relationship between followers and users.
// questions is, how would you fetch the followings?

router.get('/followers/:userId',auth, FollowListController.followers)

router.get('/followees/:userId',auth,FollowListController.followees)



router.post('/follow/:userId',auth,FollowListController.follow)





router.post('/unfollow/:userId/:list',auth,FollowListController.unfollow)




// get all comments from specific blog
router.get('/blog/:id/comments',auth,BlogController.getComments)

// get all comments from specific story

router.get('/story/:id/comments',auth, StoryController.getComments)

// fetch usernames of people who liked the blog, and the number of likes in total in this blog
router.get('/blog/:id/likes',auth, BlogController.getLikes)


// make a comment/edit/ delete for both stories and blogs

router.post('/blog/:id/comment', auth, BlogController.postComment)


router.put('/blog/comment/:commentid',auth,BlogController.editComment)


router.delete('/blog/comment/:commentid',auth, BlogController.deleteComment)


// make, edit, and delete stories comments

router.post('/story/:id/comment', auth,StoryController.postComment)

router.put('/story/comment/:commentid',auth, StoryController.editComment)


router.delete('/story/comment/:commentid',auth, StoryController.deleteComment)

// add likes/ remove likes, for both stories and blogs


router.post('/blog/:id/like',auth, BlogController.postLike)

router.delete('/blog/like/:likeid',auth, BlogController.unlike)


router.post('/story/:id/like',auth, StoryController.postLike)

router.delete('/story/like/:likeid',auth, StoryController.unlike)




router.get('/userprofile/:username', UserController.get)

router.put('/userprofile/:id',auth,upload.single('img'),UserController.editProfile)

router.delete('/userprofile/:id',auth,UserController.deleteProfile)










export {pool,router}



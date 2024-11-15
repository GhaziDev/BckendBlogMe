import { NextFunction , Request, Response} from "express"


export default function auth(req:Request,res:Response,next:NextFunction){
    console.log(req.session)
    
    if(req.session?.id){
        next()
        
    }

    else{
        console.log('no session')
        return res.status(401).json({error:'user is not authenticated'})
    }

}


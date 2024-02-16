
const isLogin = async (req,res,next)=>{

    try{
        if(req.session.user_id){}
        
        else{
            res.redirect('/login');
        }
        next();

    }catch(err){
      console.error(err.message);
    }
}

const isLogout = async(req,res,next)=>{

    try{
        if(req.session.user_id){
            
            res.redirect('/home');
            
        }
        next();

    }catch(err){
      console.error(err.message);
    }
}

module.exports={isLogin,isLogout}
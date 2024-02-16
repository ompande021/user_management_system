
const isLogin = async (req,res,next)=>{

    try{
        if(req.session.user_id){}
        
        else{
            res.redirect('/admin');
        }
        next();

    }catch(err){
      console.error(err.message);
    }
}

const isLogout = async(req,res,next)=>{

    try{
        if(req.session.user_id){
            res.redirect('/admin/home');
        }
        next();

    }catch(err){
      console.error(err.message);
    }
}

module.exports={isLogin,isLogout}
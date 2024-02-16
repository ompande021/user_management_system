const User = require('../models/userModel');
const bcrypt = require('bcrypt');
const randomstring = require("randomstring")
const nodemailer = require('nodemailer')


const securePassword = async(password)=>{

    try{
        const passwordHash = await bcrypt.hash(password,10);
        return passwordHash;
      
    }catch(err){
      console.log(err.message);
    }
}

//sending mail
const addUserMail = async(name,email,password,user_id)=>{

    try{
        const transporter=nodemailer.createTransport({
            host:"",
            port:587,
            secure:false,
            requireTLS:true,
            auth:{
                user:"",
                pass:"",
            }
        });

        const mailOption={
            from:"athervpande022@gmail.com",
            to:email,
            subject:"Admin add you and verify your mail",
            html:"<p>Hi "+name+", please click here to <a href=`http://localhost:3000/verify?id="+user_id+"`> Verify </a> your mail.</p> <br><br> <b>Email:-</b>"+email+"<br><b>Password:-</b>"+password+"",
        }
        transporter.sendMail(mailOption,(error,info)=>{
            if(error){
                console.log(error);
            }
            else{
                console.log("Email has been send:-",info.response);
            }
        })

    }catch(err){
      console.error(err.message);
    }
}


const loadLogin = async(req,res)=>{
    try{
        res.render('login')

    }catch(err){
      console.error(err.message);
    }
}

const verifyLogin = async(req,res)=>{
    try{
        const email = req.body.email;
        const psw = req.body.password;

        const userData = await User.findOne({email:email});
        if(userData){
            const passwordMatch = await bcrypt.compare(psw,userData.password);
            console.log(passwordMatch)
            if (passwordMatch) {
                if (userData.is_admin === 0) {
                    res.render('login',{message:"Please verify your mail..."})
                }else{
                    req.session.user_id = userData._id;
                    res.redirect('/admin/home')
                }
            }
            else{
                res.render('login',{message:"Email or password is incorrect..."})
            }
        }else{
            res.render('login',{message:"Email or password is incorrect"})
        }

    }catch(err){
      console.error(err.message);
    }
}

const loadDashboard = async(req,res)=>{
    try{
        const userData= await User.findById({_id:req.session.user_id})
        res.render('home',{admin:userData})
    }catch(err){
        console.log(err.message);
    }
}

const logout = async(req,res)=>{
    try{
        req.session.destroy();
        res.redirect('/admin');
    }catch(err){
        console.log(err.message);
    }
}

const adminDashboard = async(req,res)=>{
    try{
        const userData = await User.find({is_admin:0});
        res.render('dashboard',{users:userData})

    }catch(err){
      console.error(err.message);
    }
}

//Adding new your

const newUserLoad = async(req,res)=>{
    try{
        
        res.render('new-user')

    }catch(err){
      console.error(err.message);
    }
}

const addUser = async(req,res)=>{
    try{
        const name = req.body.name;
        const email = req.body.email;
        const mobile = req.body.mobile;
        const image = req.file.filename;
        const password = randomstring.generate(4);
        
        const spassword = await securePassword(password);

        const user = new User({
            name:name,
            email:email,
            mobile:mobile,
            image:image,
            password:spassword,
            is_admin:0
        })
        const userData = await user.save();

        if(userData){
            addUserMail(name,email,password,userData._id)
            res.redirect('/admin/deshboard')
        }else{
            res.render('new-user',{message:'Something wrong...'})
        }

    }catch(err){
      console.error(err.message);
    }
}

//Edit User

const editUserLoad = async(req,res)=>{
    try{
        const id = req.query.id;
        const userData = await User.findById({_id:id})
        if(userData){
            res.render('edit-user',{user:userData})
        }else{
            res.redirect('/admin/dashboard')
        }
        

    }catch(err){
      console.error(err.message);
    }
}

const updateUser = async(req,res)=>{
    try{
        const userData = await User.findByIdAndUpdate({_id:req.body.id},{ $set:{name:req.body.name, email:req.body.email, mobile:req.body.mobile, is_varifed:req.body.verify}})
        
        res.redirect('/admin/dashboard')

    }catch(err){
      console.error(err.message);
    }
}

//Delete User

const deleteUser = async(req,res)=>{
    try{
        const id = req.query.id;
        await User.deleteOne({_id:id})
        res.redirect('/admin/deshboard')

    }catch(err){
      console.error(err.message);
    }
}



module.exports = {
    loadLogin,
    verifyLogin,
    loadDashboard,
    logout,
    adminDashboard,
    newUserLoad,
    addUser,
    editUserLoad,
    updateUser,
    deleteUser
}
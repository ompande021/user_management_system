const User = require('../models/userModel');
const nodemailer= require('nodemailer');
const bcrypt = require('bcrypt');
const { use } = require('../routes/userRoute');

const securePassword = async(password)=>{

    try{
        const passwordHash = await bcrypt.hash(password,10);
        return passwordHash;
      
    }catch(err){
      console.log(err.message);
    }
}

//for send mail
const sendVerifyMail = async(name,email,user_id)=>{

    try{
        const transporter=nodemailer.createTransport({
            host:"",
            port:1,
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
            subject:"For Verification mail",
            html:"<p>Hi "+name+", please click here to <a href=`http://localhost:3000/verify?id="+user_id+"`> Verify </a> your mail.</p>",
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


const loadRegister = async (req,res)=>{

    try{
        res.render('registration')

    }catch(error){
      console.log(error.message);
    }
}

const insertUser = async (req,res)=>{

    try{
        const spassword = await securePassword(req.body.password);
        const user = new User({
            name:req.body.name,
            email:req.body.email,
            mobile:req.body.mobile,
            image:req.file.filename,
            password:spassword,
            is_admin:0
        })

        const userData = await user.save();
        if(userData){
            sendVerifyMail(req.body.name,req.body.email,userData._id)
            res.render("registration",{message:"Your registration has been successful..., Please verify your mail"})
        }
        else{
            res.render("registration",{message:"Your registration has been failed..."})
        }
    }catch(err){
      console.log(err.message);
    }
}

const verifyMail= async (req,res)=>{
    try{
        const updateInfo = await User.updateOne({_id:req.query.id},{$set:{is_varifed:1}});
        console.log(updateInfo);
        res.render("email-verified");

    }catch(err){
      console.log(err.message);
    }
}

//User Login method start

const loginLoad = async(req,res)=>{

    try{
        res.render('login')
    }catch(err){
      console.log(err.message);
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
                if (userData.is_varifed === 0) {
                    res.render('login',{message:"Please verify your mail..."})
                }else{
                    req.session.user_id = userData._id;
                    res.redirect('/home')
                }
            }
            else{
                res.render('login',{message:"Email or password is incorrect..."})
            }
        }else{
            res.render('login',{message:"Email or password is incorrect"})
        }
    }catch(err){
      console.log(err.message);
    }
}

const loadHome = async (req,res)=>{
    try{
        const userData = await User.findById({ _id:req.session.user_id})
        res.render("home",{user:userData})

    }catch(err){
       console.log(err.message);
    }
}

const userLogout = async (req,res)=>{
    try{
        req.session.destroy();
        res.redirect('/login');

    }catch(err){
       console.log(err.message);
    }
}

//Edit user details
const editLoad = async (req,res)=>{

    try{
        const id = req.query.id;
        const userData = await User.findById({_id:id});
        if(userData){
            res.render('edit',{user:userData})
        }else{
            res.redirect('/home');
        }
      
    }catch(err){
      console.error(err.message);
    }
}

const updateProfile = async (req,res)=>{
    try{
        if(req.file){
            const userData = await User.findByIdAndUpdate({ _id:req.body.user_id},{ $set:{name:req.body.name, email:req.body.email, mobile:req.body.mobile, image:req.file.filename}})

        }else{
            const userData = await User.findByIdAndUpdate({ _id:req.body.user_id},{ $set:{name:req.body.name, email:req.body.email, mobile:req.body.mobile,}})
        }
        res.redirect('/home')

    }catch(err){
      console.error(err.message);
    }
}

module.exports = {
    loadRegister,
    insertUser,
    verifyMail,
    loginLoad,
    verifyLogin,
    loadHome,
    userLogout,
    editLoad,
    updateProfile
}
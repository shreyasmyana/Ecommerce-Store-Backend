const User = require('../models/user');
const {validationResult} = require('express-validator');
const {errorHandler} = require('../helpers/dbErrorHandler');
const jwt = require('jsonwebtoken');
const expressjwt = require('express-jwt');

exports.signup = (req,res)=>{
    console.log(req.body);
    const errors = validationResult(req);
    if (!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()[0]});
    }

    const user = new User(req.body);
    user.save((err, user)=>{
        if(err){
             return res.status(400).json({
                 err:errorHandler(err)
             });
        }
        user.salt = undefined;
        user.hashed_password = undefined;
        res.json({
            user
        });
    });
};

exports.signin = (req,res)=>{
    const {email,password} = req.body
    User.findOne({email},(err,user)=>{
        if(err || !user){
            return res.status(401).json({
                error:"User with that email does not exist"
            })
        }
        if (!user.authenticate(password)){
            return res.status(401).json({
                error:"Email or Password does not match"
            })
        }
        const token = jwt.sign({_id:user._id},process.env.JWT_SECRET)
        res.cookie('t',token,{expires:new Date(Date.now()+900000)})

        const {_id,name,email,role} = user
        return res.json({token,user:{_id,name,email,role}})
    })
}

exports.signout = (req,res)=>{
    res.clearCookie('t')
    res.json({
        message:"SignOut Success"
    })
}

exports.requireSignin = expressjwt({
    secret: process.env.JWT_SECRET,
    algorithms: ["HS256"],
    userProperty: "auth"    
})

exports.isAuth = (req,res,next)=>{
    
    let user = req.profile && req.auth && req.profile._id == req.auth._id;
        if(!user){
            return res.status(403).json({
                Error: "Access denied"
            })
        } 
    next();
};

exports.isAdmin = (req,res,next)=>{
    if (req.profile.role===0){
        return res.status(403).json({
            error: "Admin resource! Access denied"
        });
    }
    next();
};
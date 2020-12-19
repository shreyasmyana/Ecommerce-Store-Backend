const express = require('express');
const router = express.Router();
const {signup, signin, signout, requireSignin} = require('../controller/auth'); 
const {userSignUpValidator} = require('../validator/');
const {check} = require('express-validator');

router.post('/signup',userSignUpValidator, signup);
router.post('/signin',signin);
router.get('/signout',signout);

router.get('/hello',requireSignin,(req,res)=>{
    res.send("Hello")
})

module.exports = router;


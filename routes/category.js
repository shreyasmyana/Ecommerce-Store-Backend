const express = require('express');
const router = express.Router();
const {create, categoryById, read, list, remove, update} = require('../controller/category')
const {userById} = require('../controller/user');
const {requireSignin, isAuth, isAdmin} = require('../controller/auth'); 

router.post('/category/create/:userId', requireSignin, isAuth, isAdmin, create);
router.put('/category/:categoryId/:userId', requireSignin, isAuth, isAdmin, update);
router.delete('/category/:categoryId/:userId', requireSignin, isAuth, isAdmin, remove);
router.get('/category/:categoryId',read);
router.get('/categories',list);


router.param('categoryId', categoryById)
router.param('userId',userById);

module.exports = router;
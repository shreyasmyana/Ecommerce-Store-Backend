const express = require('express');
const router = express.Router();
const {create, productByID, read, remove, update, list, listRelated, listCategories, listSearch, listBySearch, photo} = require('../controller/product');
const {isAdmin,isAuth,requireSignin} = require('../controller/auth');
const {userById} = require('../controller/user');

router.post('/product/create/:userId', requireSignin, isAdmin, isAuth, create );
router.get('/product/:productId', read );
router.delete('/product/:productId/:userId', requireSignin, isAdmin, isAuth, remove);
router.put('/product/:productId/:userId', requireSignin, isAdmin, isAuth, update );
router.get('/product/photo/:productId',photo);

router.get('/products', list );
router.get('/products/search',listSearch);
router.get('/products/related/:productId', listRelated );
router.get('/products/categories', listCategories );
router.post('/products/by/search', listBySearch);


router.param('userId',userById);
router.param('productId',productByID);

module.exports = router;
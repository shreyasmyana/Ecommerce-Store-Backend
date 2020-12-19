const express = require('express');
const router = express.Router();

const {isAuth, requireSignin, isAdmin} = require('../controller/auth');
const {decreaseQuantity} = require('../controller/product');
const {userById, addOrderToUserHistory} = require('../controller/user');
const {create, listOrders, getStatusValues, updateOrderStatus, orderById} = require('../controller/order');

router.post('/order/create/:userId', requireSignin, isAuth, addOrderToUserHistory, decreaseQuantity, create)

router.get('/order/list/:userId', requireSignin, isAuth, isAdmin, listOrders)

router.get('/order/status-values/:userId', requireSignin, isAuth, isAdmin, getStatusValues)

router.put('/order/:orderId/status/:userId', requireSignin, isAuth, isAdmin, updateOrderStatus)

router.param("userId", userById);

router.param("orderid", orderById);


module.exports = router;
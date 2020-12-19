require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const authroutes = require('./routes/auth');
const userroutes = require('./routes/user');
const categoryroutes = require('./routes/category');
const productroutes = require('./routes/product');
const braintreeroutes = require('./routes/braintree');
const orderroutes = require('./routes/order');

const bodyparser = require('body-parser');
const cors = require('cors');
const morgan = require('morgan');
const cookieparser = require('cookie-parser');


const app = express();

mongoose.connect(process.env.DATABASE,{useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false })
        .then(()=>{console.log("DataBase Connected ")})

// Middleware
app.use(cors());
app.use(bodyparser.json());
app.use(cookieparser());
app.use(morgan('dev'));
app.use('/api',authroutes);
app.use('/api',userroutes);
app.use('/api',categoryroutes);
app.use('/api',productroutes);
app.use('/api',braintreeroutes);
app.use('/api',orderroutes);

const port = process.env.PORT
app.listen(port, ()=>{
    console.log(`Server Listening on port ${port}`)
})
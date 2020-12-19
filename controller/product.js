const Product = require('../models/product');
const formidable = require('formidable');
const {errorHandler} = require('../helpers/dbErrorHandler');
const fs = require('fs');
const _ = require('lodash');
const { exec } = require('child_process');
const product = require('../models/product');

exports.productByID = (req, res, next, id)=>{
    Product.findById(id)
            .populate("category")
            .exec((err, product)=>{
        if(err){
            return res.status(400).json({
                error: "Product not found"
            })
        }
        req.product = product
        next();
    })
}

exports.read = (req,res)=>{
    req.product.photo = undefined;
    return res.json(req.product)
}

exports.create = (req,res)=>{
    
    let form = new formidable.IncomingForm();
    form.keepExtensions = true;
    form.parse(req, (err, fields, files)=>{
        if(err){
            return res.status(400).json({
                error:'Image could not be uploaded'
            })
        }
        const { name, description, price, category, quantity, shipping } = fields;
        console.log(fields);
        if(!name || !description || !price || !category || !quantity || !shipping){
            return res.status(400).json({
                error:'All fields are required'
            })
        }

        let product = new Product(fields);
        if(files.photo){
            product.photo.data = fs.readFileSync(files.photo.path);
            product.photo.contentType = files.photo.type;
        }

        product.save((err,data)=>{
            if(err){
                return res.status(400).json({
                   error: errorHandler(err)
                })
            }
            res.json(data);
        })
    })

}

exports.update =(req,res)=>{

    let form = new formidable.IncomingForm();
    form.keepExtensions = true;
    form.parse(req, (err, fields, files)=>{
        if(err){
            return res.status(400).json({
                error:'Image could not be uploaded'
            })
        }
        // const { name, description, price, category, quantity, shipping } = fields;
        // console.log(fields);
        // if(!name || !description || !price || !category || !quantity || !shipping){
        //     return res.status(400).json({
        //         error:'All fields are required'
        //     })
        // }

        let product = req.product;
        product = _.extend(product,fields)  

        if(files.photo){
            product.photo.data = fs.readFileSync(files.photo.path);
            product.photo.contentType = files.photo.type;
        }

        product.save((err,data)=>{
            if(err){
                return res.status(400).json({
                   error: errorHandler(err)
                })
            }
            res.json(data);
        })
    })
}

exports.remove = (req, res)=>{
    let product = req.product;
    product.remove((err, deletedProduct)=>{
        if(err){
            return res.status(400).json({
                error: errorHandler(err)
             })
        }
        return res.json({
            message: "Product deleted successfully"
        })
    })
}

exports.list = (req, res)=>{
    let order = req.query.order ? req.query.order : 'asc';
    let sortBy = req.query.sortBy ? req.query.sortBy : '_id';
    let limit = req.query.limit ? parseInt(req.query.limit) : 6;

    Product.find()
            .select("-photo")
            .populate("category")
            .sort([[sortBy,order]])
            .limit(limit)
            .exec((err, products)=>{
                if(err){
                    return res.status(400).json({
                        error:'Products Not Found'
                    })
                }
                res.json(products)
            });
};

exports.listRelated = (req, res)=>{
    let limit = req.query.limit ? parseInt(req.query.limit) : 6;

    product.find({_id: {$ne: req.product}, category:req.product.category})
            .limit(limit)
            .populate('category','_id name')
            .exec((err, products)=>{
                if(err){
                    return res.status(400).json({
                        error: "Products Not Found"    
                    })
                }
                res.json(products);
            })
}

exports.listCategories = (req, res)=>{
    product.distinct('category',{},(err,categories)=>{
        if(err){
            return res.status(400).json({
                error:'Categories Not Found'
            });
        }
        res.json(categories);
    })
}

exports.listSearch = (req, res)=>{
    const query = {};

    if(req.query.search){
        query.name = {$regex: req.query.search, $options:'i'}

        if(req.query.category && req.query.category !== 'All'){
            query.category = req.query.category;
        }

        Product.find(query, (err, products)=>{
            if(err){
                return res.status(400).json({
                    error:  errorHandler(err)
                })    
            }
            res.json(products)
        }).select('-photo')
    }

}

exports.listBySearch = (req, res)=>{
    let order = req.body.order ? req.body.order : 'asc';
    let sortBy = req.body.sortBy ? req.body.sortBy : '_id';
    let limit = req.body.limit ? parseInt(req.body.limit) : 100;
    let skip = parseInt(req.body.skip);
    let findArgs = {};
    
    for (let key in req.body.filters){
        if (req.body.filters[key].length > 0){
            if(key === 'price'){
                findArgs[key] = {
                    $gte : req.body.filters[key][0],
                    $lte : req.body.filters[key][1]
                }
            }
            else{
                findArgs[key] = req.body.filters[key];
            }
        }
    }

    product.find(findArgs)
            .select('-photo')
            .populate('category')
            .sort([[sortBy, order]])
            .skip(skip)
            .limit(limit)
            .exec((err, products)=>{
                if(err){
                    return res.status(400).json({
                        error: 'Products Not Found'
                    })
                }
                res.json({
                    size: products.length,
                    products
                });
            })

}

exports.photo = (req, res, next)=>{
    
    if(req.product.photo.data){
        res.set('Content-Type', req.product.photo.contentType)
        return res.send(req.product.photo.data) 
    }
    next();
}

exports.decreaseQuantity = (req, res, next)=>{

    let bulkOps = req.body.order.products.map((item)=>{
        return {
            updateOne:{
                filter:{_id:item._id},
                update:{ $inc:{quantity:-item.count, sold:+item.count }}
            }   
        }
    })

    Product.bulkWrite(bulkOps,{},(error, products)=>{
        if(error){
            return res.status(400).json({
                error:"Could Not Update Product"
            });
        }
        next();
    })
}
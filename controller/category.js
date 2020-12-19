const Category = require('../models/category');
const {errorHandler} = require('../helpers/dbErrorHandler');

exports.categoryById = (req,res,next, id)=>{
    Category.findById(id).exec((err, category)=>{
        if(err){
            return res.status(400).json({
                Error: 'Category Does Not Exist'
            });
        }
        req.category = category
        next();
    })
}

exports.read = (req, res)=>{
    return res.json(req.category);
}

exports.create = (req,res)=>{
    const category = new Category(req.body);

    category.save((err,data)=>{
        if(err){
            return res.status(400).json({
                Error: errorHandler(err)
            })
        }
        return res.json({data})
    })
}

exports.update = (req, res)=>{
    let category = req.category;
    category.name = req.body.name;

    category.save((err, category)=>{
        if(err){
            return res.status(400).json({
               Error: errorHandler(err) 
            })
        }
        return res.json(category);
    })
}

exports.remove = (req, res)=>{
    let category = req.category;
    category.remove((err, data)=>{
        if(err){
            return res.status(400).json({
               Error: errorHandler(err) 
            })
        }
        return res.json({
            message: 'category has been removed'
        });
    })
}

exports.list = (req,res)=>{
  
    Category.find().exec((err,categories)=>{
        if(err){
            return res.status(400).json({
               Error: errorHandler(err) 
            })
        }
        return res.json(categories);
    })
}
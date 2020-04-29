const Product = require("../models/product")
const formidable = require("formidable")
const _ = require("lodash")
const fs = require("fs");


exports.getProductById = (req,res,next) => {
    Product.findById(id)
    .populate("category")
    .exec((err,product) => {
        if(err){
            res.status(400).json({
                error:"Product not found"
            })
        }
        req.product = product;
        next();
    })
} 

exports.createProduct = (req,res) => {
    let form = new formidable.IncomingForm();
    form.keepExtensions = true;
    form.parse(req, (err, fields, file) =>{
        if(err){
            return res.status(400).json({
                error: "Problem with image"
            });
        }

        //destructure the fields
        //TODO: express validation
        const {name, description,price, category,stock,age} = fields;
        if(
            !name ||
            !description ||
            !price ||
            !category||
            !stock||
            !age
        ){
            return res.status(400).json({
                error:"All fields are compulsory"
            })
        }
     

        let product = new Product(fields)

        //handle the file
        if(file.photo){
            if(file.photo.size > 3000000){
                return res.status(400).json({
                    error: "File size too big should be under 2.5MB"
                })
            }
            product.photo.data = fs.readFileSync(file.photo.path)
            product.photo.contentType = file.photo.type;
        }
        product.save((err,product) => {
            if(err){
                return res.status(400).json({
                    error: "Saving item in DB failed"
                })
            }
            res.json(product)
        })
    })
}


exports.getProduct = (req,res) => {
    req.product.photo = undefined;
    return res.json(req.product)
}

//middleware
exports.photo = (req,res,next) => {
    if(req.product.photo.data){
        res.set("Content-Type", req.product.photo.contentType)
        return res.send(req.product.photo.data)
    }
    next()
}


exports.updateProduct = (req,res) => {
    let form = new formidable.IncomingForm();
    form.keepExtensions = true;

    form.parse(req, (err, fields, file) =>{
        if(err){
            return res.status(400).json({
                error: "Problem with image"
            });
        }

        //destructure the fields
        //TODO: express validation
    
     
        //updates
        let product = req.product;
        product = _.extend(product, fields)
        //*** */

        //handle the file
        if(file.photo){
            if(file.photo.size > 3000000){
                return res.status(400).json({
                    error: "File size too big should be under 2.5MB"
                })
            }
            product.photo.data = fs.readFileSync(file.photo.path)
            product.photo.contentType = file.photo.type;
        }
        product.save((err,product) => {
            if(err){
                return res.status(400).json({
                    error: "Can't Update"
                })
            }
            res.json(product)
        })
    })
}

exports.removeProduct = (req,res) => {
    const product = req.product;

  product.remove((err, deletedProduct) => {
    if (err) {
      return res.status(400).json({
        error: "Failed to delete this product"
      });
    }
    res.json({
      message: "Successfully deleted",
      deletedProduct
    });
  });
}


exports.getAllProducts = (req,res) => {
   
    let sortBy = req.query.sortBy ? req.query.sortBy : "_id";
    Product.find()
        .select("-photo")
        .populate("category")
        .sort([[sortBy, "asc"]])
  
        .exec((err,products) => {
            if(err){
                return res.status(400).son({
                    error:"No Product found"
                })
            }
            res.json(products)
        })
}

exports.getAllUniqueCategories = (req,res) => {
    Product.distinct("category",{},(err,category) => {
        if(err){
            return res.status(400).json({
                error: "No category found"
            })
        }
        res.json(category)
    })
}

//update stock middleware
exports.updateStock = (req,res,next) => {
        let myOperations = req.body.order.products.map(prod => {
            return {
                updateOne: {
                    filter: {_id: prod._id}, //find
                    update: {$inc: {stock: -prod.count,sold: +prod.count}} //update
                }
            }
        })
        Product.bulkWrite(myOperations,{},(err, products) => {
            if(err){
                return res.status(400).json({
                    error: "Bulk operation failed"
                })
            }

            next();
        })
}

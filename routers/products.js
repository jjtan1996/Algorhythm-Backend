const {Product} = require('../models/product');
const {Category} = require('../models/category');
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const multer = require('multer');

const FILE_TYPE_MAP = {
    //key : val (MIME TYPE)
    'image/png': 'png',
    'image/jpeg': 'jpeg',
    'image/jpg': 'jpg'
}

//multer image uploading
const storage = multer.diskStorage({
    destination: function (req, file, cb) {

        //file upload extension validation
        const isValid = FILE_TYPE_MAP[file.mimetype];
        let uploadError = new Error('invalid image type');

        if(isValid){
            uploadError = null
        }

      cb(uploadError, 'public/uploads')
    },
    filename: function (req, file, cb) {
      //creating a unique filename for each upload
      const fileName = file.originalname.split(' ').join('-');

      //getting file extension
      const extension = FILE_TYPE_MAP[file.mimetype];

      cb(null, `${fileName}-${Date.now()}.${extension}`)
    }
  })
  
  const uploadOptions = multer({ storage: storage })

//get product by as all or by category
router.get(`/`, async (req, res) =>{

    let filter = {};

    if (req.query.category)
    {
        filter = {category: req.query.category.split(',')}
    }
    const productList = await Product.find(filter).populate('category');
    if(!productList){
        res.status(500).json({success: false})
    }
    res.send(productList);
});

//get product by id
router.get(`/:id`, async (req, res) =>{
    const product = await Product.findById(req.params.id).populate('category');
    if(!product){
        res.status(500).json({success: false})
    }
    res.send(product);
});

//create with single image upload
router.post(`/`, uploadOptions.single('image'), async (req, res) =>{
    const category = await Category.findById(req.body.category);
    if(!category) 
    {
        return res.status(400).send('Invalid Product');
    }

    const file = req.file;
    if(!file) return res.status(400).send('No image in the request');

    const fileName = req.file.filename;
    const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;

    let product = new Product({
        name: req.body.name,
        description: req.body.description,
        richDescription: req.body.richDescription,
        image: `${basePath}${fileName}`,
        images: req.body.images,
        brand: req.body.brand,
        price: req.body.price,
        category: req.body.category,
        countInStock: req.body.countInStock,
        rating: req.body.rating,
        reviewCount: req.body.reviewCount,
        isFeatured: req.body.isFeatured,
        dateCreated: req.body.dateCreated,
    })

    product = await product.save();

    if(!product){
        return res.status(500).send('Product cannot be created');
    }

    res.send(product);
});

//update
router.put('/:id', uploadOptions.single('image'), async (req, res) => {
    if(!mongoose.isValidObjectId(req.params.id)){
        res.status(400).send('Invalid Product ID');
    }

    let category = await Category.findById(req.body.category);
    if(!category) 
    {
        return res.status(400).send('Invalid Category');
    }

    //updating a single image
    const product = await Product.findById(req.params.id);
    if(!product) return res.status(400).send('Invalid Product')

    const file = req.file
    let imagePath;

    if(file){
        const fileName = file.filename;
        const basePath = `${req.protocol}://${req.get('host')}/public/uploads`
        imagePath = `${basePath}${fileName}`;
    } else{
        imagePath = product.image;
    }

    const updatedProduct = await Product.findByIdAndUpdate(
        req.params.id,
        {
            name: req.body.name,
            description: req.body.description,
            richDescription: req.body.richDescription,
            image: imagePath,
            images: req.body.images,
            brand: req.body.brand,
            price: req.body.price,
            category: req.body.category,
            countInStock: req.body.countInStock,
            rating: req.body.rating,
            reviewCount: req.body.reviewCount,
            isFeatured: req.body.isFeatured,
            dateCreated: req.body.dateCreated,
        },
        {new: true} //return new update data
    )

    if(!updatedProduct){
        return res.status(404).send('The product cannot be updated');
    }

    res.send(updatedProduct)
});

//delete
router.delete('/:id', (req, res) =>{
    Product.findByIdAndRemove(req.params.id).then(product=>{
        if(product){
            return res.status(200).json({success: true, message: 'the product is successfully deleted'})
        } else {
            return res.status(404).json({success: false, message: "product not found"})
        }
    }).catch(err=>{
        return res.status(400).json({success: false, error: err})
    })
})

//get product count
router.get(`/get/count`, async (req, res) =>{
    const productCount = await Product.countDocuments()

    if(!productCount){
        res.status(500).json({success: false})
    }

    res.send({
        productCount: productCount
    });
});

//get isFeatured products
router.get(`/get/isFeatured/:count`, async (req, res) =>{
    const count = req.params.count ? req.params.count : 0
    const productisFeatured = await Product.find({isFeatured: true}).limit(+count)

    if(!productisFeatured){
        res.status(500).json({success: false})
    }

    res.send(productisFeatured);
});

router.put(
    '/gallery-images/:id', 
    uploadOptions.array('images', 10), 
    async (req, res) => {

        if(!mongoose.isValidObjectId(req.params.id)){
            res.status(400).send('Invalid Product ID');
        }

        const files = req.files;
        let imagesPaths = [];
        const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;

        if(files){
            files.map(file=>{
                imagesPaths.push(`${basePath}${file.filename}`)
            })
        }

        let product = await Product.findByIdAndUpdate(
            req.params.id,
            {
                images: imagesPaths
            },
            {new: true} //return new update data
        )

        if(!product){
            return res.status(404).send('The product cannot be updated');
        }
    
        res.send(product)

})

module.exports = router;
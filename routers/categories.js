const {Category} = require('../models/category');
const express = require('express');
const router = express.Router();

//read
router.get(`/`, async (req, res) =>{
    const categoryList = await Category.find();
    if(!categoryList){
        res.status(500).json({success: false})
    }
    res.status(200).send(categoryList);
})

//read by id
router.get('/:id', async (req, res) => {
    const category = await Category.findById(req.params.id);

    if(!category){
        res.status(500).json({message: 'Category with given id not found'})
    }
    res.status(200).send(category);
})

//update
router.put('/:id', async (req, res) => {
    const category = await Category.findByIdAndUpdate(
        req.params.id,
        {
            name: req.body.name,
            color: req.body.color,
            icon: req.body.icon,
            image: req.body.image,
        },
        {new: true} //return new update data
    )

    if(!category){
        return res.status(404).send('The category cannot be updated');
    }

    res.send(category)
})

//write
router.post('/', async (req, res) => {
    let category = new Category({
        name: req.body.name,
        color: req.body.color,
        icon: req.body.icon,
        image: req.body.image,
    })

    category = await category.save();

    if(!category){
        return res.status(404).send('The category cannot be created');
    }

    res.send(category)
})

//delete
router.delete('/:id', (req, res) =>{
    Category.findByIdAndRemove(req.params.id).then(category=>{
        if(category){
            return res.status(200).json({success: true, message: 'the category is successfully deleted'})
        } else {
            return res.status(404).json({success: false, message: "category not found"})
        }
    }).catch(err=>{
        return res.status(400).json({success: false, error: err})
    })
})


module.exports = router;
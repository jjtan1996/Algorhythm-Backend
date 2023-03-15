const {Order} = require('../models/order');
const express = require('express');
const {OrderItem} = require('../models/order-item');
const router = express.Router();

//order list
router.get(`/`, async (req, res) =>{
    const orderList = await Order.find()
    .populate('user', 'name')
    .sort({'dateOrdered': -1});

    if(!orderList){
        res.status(500).json({success: false})
    }
    res.send(orderList);
})

//get specific order
router.get(`/:id`, async (req, res) =>{

    //show all details of order. user info, products, and categories of an order
    const order = await Order.findById(req.params.id)
    .populate('user', 'name')
    .populate({ 
        path: 'orderItems', populate: {
            path: 'product', populate: 'prod_category'}});

    if(!order){
        res.status(500).json({success: false})
    }
    res.send(order);
})

//new order
router.post('/', async (req, res) => {

    const orderItemsIds = Promise.all(req.body.orderItems.map(async orderitem => {
        let newOrderItem = new OrderItem({
            quantity: orderitem.quantity,
            product: orderitem.product
        })

        newOrderItem = await newOrderItem.save();

        return newOrderItem._id;
    }))

    const orderItemsIdsResolved = await orderItemsIds;
    
    const totalPrices = await Promise.all(orderItemsIdsResolved.map(async (orderItemId)=>{
        const orderItem = await OrderItem.findById(orderItemId).populate('product', 'prod_price');
        const totalPrice = orderItem.product.prod_price * orderItem.quantity;

        return totalPrice;
    }))

    const totalPrice = totalPrices.reduce((a,b) => a + b, 0);

    let order = new Order({
        //orderItems: req.body.orderItems,
        orderItems: orderItemsIdsResolved,
        shippingAddress1: req.body.shippingAddress1,
        shippingAddress2: req.body.shippingAddress2,
        city: req.body.city,
        zip: req.body.zip,
        country: req.body.country,
        phone: req.body.phone,
        status: req.body.status,
        totalPrice: totalPrice,
        user: req.body.user,
    })

    order = await order.save();

    if(!order){
        return res.status(404).send('The order cannot be created');
    }

    res.send(order)
})

//update
router.put('/:id', async (req, res) => {
    const order = await Order.findByIdAndUpdate(
        req.params.id,
        {
            status: req.body.status
        },
        {new: true} //return new update data
    )

    if(!order){
        return res.status(404).send('The order cannot be updated');
    }

    res.send(order)
})

//delete
router.delete('/:id', (req, res) =>{
    Order.findByIdAndRemove(req.params.id).then(async order=>{
        //loop of orderItems map to delete all orderItems with the same orderID
        if(order){
            await order.orderItems.map(async orderItem => {
                await OrderItem.findByIdAndRemove(orderItem)
            })
            return res.status(200).json({success: true, message: 'the order is successfully deleted'})
        } else {
            return res.status(404).json({success: false, message: "order not found"})
        }
    }).catch(err=>{
        return res.status(400).json({success: false, error: err})
    })
})

//get total sum
router.get('/get/totalsales', async (req, res) => {
    const totalSales = await Order.aggregate([
        {$group: {_id: null, totalSales: {$sum : '$totalPrice'}}}
    ])

    if (!totalSales){
        return res.status(400).send('The order sales cannot be generated')
    }

    res.send({totalSales: totalSales.pop().totalSales})
})

//get order count
router.get(`/get/count`, async (req, res) =>{
    const orderCount = await Order.countDocuments()

    if(!orderCount){
        res.status(500).json({success: false})
    }

    res.send({
        orderCount: orderCount
    });
});

//get user orders
router.get(`/get/userorders/:userid`, async (req, res) =>{
    const userOrderList = await Order.find({user: req.params.userid})
    .populate({ 
        path: 'orderItems', populate: {
            path: 'product', populate: 'prod_category'}})
            .sort({'dateOrdered': -1});

    if(!userOrderList){
        res.status(500).json({success: false})
    }
    res.send(userOrderList);
})

module.exports = router;
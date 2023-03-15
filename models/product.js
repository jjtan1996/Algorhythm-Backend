const mongoose = require('mongoose');

const productSchema = mongoose.Schema({
    prod_name: {
        type: String,
        required: true,
    },
    prod_description: {
        type: String,
        required: true,
    },
    prod_richDescription: {
        type: String,
        default: '',
    },
    prod_image: {
        type: String,
        default: '',
    },
    prod_images: [{
        type: String,
        default: '',
    }],
    prod_brand: {
        type: String,
        default: '',
    },
    prod_price: {
        type: Number,
        default: 0,
    },
    prod_category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required:true,
    },
    prod_stockCount: {
        type: Number,
        required: true,
        min: 0,
        max: 9999,
    },
    prod_rating: {
        type: Number,
        required: false,
        min: 0,
        max: 5,
    },
    prod_reviewCount: {
        type: Number,
        required: false,
    },
    prod_featured: {
        type: Boolean,
        default: false,
    },
    prod_dateCreated: {
        type: Date,
        default: Date.now,
    },
})

productSchema.virtual('id').get(function () {
    return this._id.toHexString();
})

productSchema.set('toJSON', {
    virtuals: true,
});

exports.Product = mongoose.model('Product', productSchema)
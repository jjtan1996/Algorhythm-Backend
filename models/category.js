const mongoose = require('mongoose');

const categorySchema = mongoose.Schema({
    cat_name: {
        type: String,
        required: true,
    },
    cat_color: {
        type: String,
    },
    cat_icon: {
        type: String,
    },
    cat_image: {
        type: String,
        default: "",
    },
})

categorySchema.virtual('id').get(function () {
    return this._id.toHexString();
})

categorySchema.set('toJSON', {
    virtuals: true,
});

exports.Category = mongoose.model('Category', categorySchema)
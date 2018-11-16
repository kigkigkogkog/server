var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var productSchema = new Schema({
    "productId":Number,
    "productName":String,
    "productPrice":Number,
    "productImg":String
})

module.exports = mongoose.model('Good',productSchema);//查表, Good == goods表
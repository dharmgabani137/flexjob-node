
const mongoose = require('mongoose');

var reviewSchema = new mongoose.Schema({
    userId : {
        type : mongoose.Schema.Types.ObjectId,
        require : true,
        ref:"user"
    },
    reviewer :{
        type : mongoose.Schema.Types.ObjectId,
        require : true,
        ref:"user"
    },
    star : {
        type : Number,
        require : true  
    },
    feedBack : {
        type : String,
        require : true
    }
},{ timestamps: {} });
const reviewsModel = mongoose.model('reviews' , reviewSchema)
module.exports = reviewsModel;
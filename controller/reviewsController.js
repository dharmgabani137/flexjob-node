const { default: mongoose } = require('mongoose');
const reviewsModel = require('../models/reviewsModel');
const joi = require('joi');

async function reviews(req, 
    ) {
    try {
        var data = req.body;
    const schema = joi.object().keys({
        userId: joi.string().required(),
        reviewer : joi.string(),
        feedBack: joi.string().required(),
        star: joi.number().min(1).max(5).required(),
    })
    var valid = schema.validate(data)
    if (valid?.error) {
        return res.json({
            status : false,
            message: valid.error.message
        })
    }else{
        var user = await reviewsModel.create({ userId: data.userId, reviewer: req.payload._id, feedBack: data.feedBack, star: data.star });
        console.log(user);
        res.json({
            status : true,
            message : "review sended successfully"
        })

    }
    } catch (error) {
        res.status(500).json({
            status: false,
            message: error.message
        });
    }
    

}

async function reviewList(req,res) {
    try {
        var data = req.query;
        var reviewList = await reviewsModel.aggregate([
            {$match:{userId : new mongoose.Types.ObjectId(data.id) }},
            {
                $lookup: {
                    from: "users",
                    localField: "reviewer",
                    foreignField: "_id",
                    as: "user"
                }
            }
        ]);
        res.json({
            userReview : reviewList,
            status : true
        })
    } catch (error) {
        res.status(500).json({
            status: false,
            message: error.message
        });
    }
   
}
   
   


module.exports = {
    reviews,
    reviewList
}

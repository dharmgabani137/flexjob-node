const reviewsModel = require('../models/reviewsModel');
const joi = require('joi');

async function reviews(req, res) {
    var data = req.body;
    const schema = joi.object().keys({
        userId: joi.string().required(),
        feedBack: joi.string().required(),
        star: joi.number().min(1).max(5).required(),
    })
    var valid = schema.validate(data)
    if (valid?.error) {
        return res.json({
            error: valid.error.message
        })
    }else{
        var user = await reviewsModel.create({ userId: data.userId, reviewer: req.payload.userId, feedBack: data.feedBack, star: data.star });
        console.log(user);
        res.json({
            status : true,
            message : "review sended successfully"
        })

    }

}

module.exports = {
    reviews
}

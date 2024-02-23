const expertiseModel = require('../models/expertiseModels');
const PostModel = require('../models/postModels');
const joi = require('joi');
const moment = require('moment');
const UserModel = require('../models/userModels');
const { login } = require('./authController');

async function post(req, res) {

    var data = req.body;
    const schema = joi.object().keys({
        userId: joi.string().required(),
        description: joi.string().alphanum().min(10).max(1000).required(),
        title: joi.string().min(3).required(),
        expertise: joi.array().required(),
        budget: joi.number().required(),
        status: joi.string().required()
    })

    var valid = schema.validate(data)
    if (valid?.error) {
        return res.json({
            error: valid.error.message
        })
    }
    var user = await PostModel.create({ userId: data.userId, description: data.description, title: data.title, expertise: data.expertise, budget: data.budget, status: data.status });
    res.json({
        status: true,
        message: "created successfully"
    })
}

async function postUpdate(req, res) {
    var data = req.body;
    const schema = joi.object().keys({
        id: joi.string().required(),
        userId: joi.string().required(),
        description: joi.string().alphanum().min(10).max(1000).required(),
        title: joi.string().min(3).max(10).required(),
        expertise: joi.array().required(),
        budget: joi.number().required(),
        status: joi.string().required()

    })
    var valid = schema.validate(data)
    if (valid?.error) {
        return res.json({
            error: valid.error.message
        })
    }
    var user = await PostModel.updateOne({ _id: data.id }, { userId: data.userId, budget: data.budget, status: data.status });
    if (user.modifiedCount == 0) {
        res.json({
            status: false,
            message: "not updated"
        })
    }
    else {
        res.json({
            status: true,
            message: "update successfully"
        })
    }

};

async function postDelete(req, res) {
    var data = req.body;
    var user = await PostModel.deleteOne({ _id: data.id });
    if (user.deletedCount == 1) {
        res.json({
            status: true,
            message: "deleted successfully"

        })
    }
    else {
        res.json({
            status: false,
            message: "not deleted"

        })
    }

}

async function postList(req, res) {

    const pageNumber = req.query.page || 1; // Get the current page number from the query parameters
    var limit = req.query.limit || 5;
    // Number of items per page

    var { docs, total, limit, page, pages } = await PostModel.paginate({}, { page: pageNumber, limit: limit });

    var newD = await Promise.all(docs.map(async (v) => ({
        ...v._doc, formattedTime: moment(v.createdAt).fromNow(), //spread
        expertise: await expertiseModel.find({
            _id: { $in: v.expertise }
        })
    })))
    res.json({
        users: newD,
        total,
        limit,
        page,
        pages,
    });
}


async function likePost(req, res) {
    var data = req.body;
    var loginUser = req.payload;
    var findUser = await PostModel.findOne({ _id: data.postId });
        if(!findUser){
            res.json({
                status : false,
                message : "post not found"
            })
        }
        if(findUser.likeBy.includes(loginUser._id)){
            const index = findUser.likeBy.indexOf(loginUser._id);
            findUser.likeBy.splice(index,1);
            findUser.save();
            res.json({
                    status : true,
                    like : false,
                    message : "like removed"
            })
        }
        else{
            findUser.likeBy.push(loginUser._id);
            findUser.save();
            res.json({
                status : true,
                like : true,
                message : "post liked successfully"
            })
        }
}

async function savePost(req,res) {
    var data = req.body;
    var loginUser = req.payload;
    var user = await UserModel.findOne({_id : loginUser._id});
    if(!user){
        res.json({
            status : false,
            message : "user not found"
        })
    }
    if(user.savedJob.includes(data.postId)){
        const index = user.savedJob.indexOf(loginUser._id);
        user.savedJob.splice(index,1);
        user.save();
        res.json({
                status : true,
                like : false,
                message : "post removed"
        })
    }
    else{
        user.savedJob.push(data.postId);
        user.save();
        res.json({
            status : true,
            like : true,
            message : "post saved successfully"
        })  
    }



}

module.exports = {
    post,
    postUpdate,
    postDelete,
    postList,
    likePost,
    savePost
}


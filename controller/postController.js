const expertiseModel = require('../models/expertiseModel');
const PostModel = require('../models/postModels');
const joi = require('joi');
const moment = require('moment');
const UserModel = require('../models/userModels');
const { default: mongoose } = require('mongoose');

async function post(req, res) {

    var data = req.body;
    const schema = joi.object().keys({
        // userId: joi.string().required(),
        description: joi.string().min(10).max(1000).required(),
        title: joi.string().min(3).required(),
        expertise: joi.array().required(),
        budget: joi.number().required(),
    })

    var valid = schema.validate(data)
    if (valid?.error) {
        return res.json({
            error: valid.error.message
        })
    }
    var user = await PostModel.create({ userId: req.payload._id, description: data.description, title: data.title, expertise: data.expertise, budget: data.budget });
    res.json({
        status: true,
        message: "created successfully"
    })
}

async function postUpdate(req, res) {
    var data = req.body;
    const schema = joi.object().keys({
        id: joi.string(),
        userId: joi.string(),
        description: joi.string().min(10).max(1000),
        title: joi.string().min(3).max(10),
        expertise: joi.array(),
        budget: joi.number(),
        status: joi.string(),

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

    const searchQuery = req.query.s;
    const search = req.query.e;

    // pagination
    const page = parseInt(req.query.page || 1);
    const limit = parseInt(req.query.limit || 3);

    // Calculate the start and end indexes for the requested page
    var skip = (page - 1) * limit;

    var aggregate = [
        {
            $lookup: {
                from: "users",
                localField: "userId",
                foreignField: "_id",
                as: "user"
            }
        },
        { $sort: { createdAt: -1 } }
    ];


    if (req.query?.s) {
        aggregate.push({ $match: { $or: [{ title: { $regex: searchQuery, $options: 'i' } }, { description: { $regex: searchQuery, $options: 'i' } }] } })
    }


    var count = await PostModel.aggregate([...aggregate, { $count: "total" }])

    aggregate.push({ $skip: skip })
    aggregate.push({ $limit: limit })

    var user = await PostModel.aggregate(aggregate)
    console.log(aggregate, 'aggregate');


    var newD = await Promise.all(user.map(async (v) => ({
        ...v, //spread
        formattedTime: moment(v.createdAt).fromNow(),
        expertise: await expertiseModel.find({
            _id: { $in: v.expertise }

        }),
        liked: v.likeBy.includes(req.payload._id)
    })))

    var totalPages = Math.ceil(count[0].total / limit)

    res.json({
        data: newD,
        totalPages: totalPages,
        currentPage: page,
        nextPage: page + 1 > totalPages ? false : page + 1,
        prevPage: page - 1 >= 1 ? page - 1 : false,
        message: "success"
    })

}




async function likePost(req, res) {
    var data = req.body;
    var loginUser = req.payload;
    var findUser = await PostModel.findOne({ _id: data.postId });
    if (!findUser) {
        res.json({
            status: false,
            message: "post not found"
        })
    }
    if (findUser.likeBy.includes(loginUser._id)) {
        const index = findUser.likeBy.indexOf(loginUser._id);
        findUser.likeBy.splice(index, 1);
        findUser.save();
        res.json({
            status: true,
            like: false,
            message: "like removed"
        })
    }
    else {
        findUser.likeBy.push(loginUser._id);
        findUser.save();
        res.json({
            status: true,
            like: true,
            message: "post liked successfully"
        })
    }
}

async function savePost(req, res) {
    var data = req.body;
    var loginUser = req.payload;
    var user = await UserModel.findOne({ _id: loginUser._id });
    if (!user) {
        res.json({
            status: false,
            message: "user not found"
        })
    }
    if (user.savedJob.includes(data.postId)) {
        const index = user.savedJob.indexOf(loginUser._id);
        user.savedJob.splice(index, 1);
        user.save();
        res.json({
            status: true,
            like: false,
            message: "post removed"
        })
    }
    else {
        user.savedJob.push(data.postId);
        user.save();
        res.json({
            status: true,
            like: true,
            message: "post saved successfully"
        })
    }



}

async function postDataById(req, res) {
    console.log(req.params, 'req.params.id');

    var post = await PostModel.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(req.params.id)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "userId",
                foreignField: "_id",
                as: "user"
            }
        }
    ]);

    if (!post) {
        return res.json({
            status: false,
            message: "post not found"
        })
    }
    console.log(post, 'post');
    var expertise = await expertiseModel.find({
        _id: { $in: post[0].expertise }
    })

    res.json({
        data: {
            ...post[0], expertise: expertise,
            formattedTime: moment(post[0].createdAt).fromNow(),
            liked: post[0].likeBy.includes(req.payload._id)
        },
        status: true,
    })
}

module.exports = {
    post,
    postUpdate,
    postDelete,
    postList,
    likePost,
    savePost,
    postDataById
}


const expertiseModel = require('../models/expertiseModel');
const PostModel = require('../models/postModels');
const joi = require('joi');
const moment = require('moment');
const UserModel = require('../models/userModels');
const { default: mongoose } = require('mongoose');
const e = require('express');
const { sendNotification } = require('./notificationController');
const ProposalModel = require('../models/proposalModels');

async function post(req, res) {
    try {
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
                status: false,
                message: valid.error.message
            })
        }
        console.log(req.payload);
        var user = await PostModel.create({ userId: req.payload._id, description: data.description, title: data.title, expertise: data.expertise, budget: data.budget });
        res.json({
            status: true,
            message: "created successfully"
        })
    } catch (error) {
        res.json({
            status: false,
            message: error.message
        });
    }


}

async function postUpdate(req, res) {
    try {
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
                status: false,
                message: valid.error.message
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
    } catch (error) {
        res.json({
            status: false,
            message: error.message
        });
    }


};

async function postDelete(req, res) {
    try {
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
    } catch (error) {
        res.json({
            status: false,
            message: error.message
        });
    }


}

async function postList(req, res) {
    try {
        const searchQuery = req.query?.s;
        const ex = req.query?.e;

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

        if (ex) {
            var expertise = await expertiseModel.find({ technology: { $regex: ex, $options: 'i' } }, { _id: 1 });
            var eId = expertise.map(e => e._id.toString())

            aggregate.push({
                $match: { expertise: { $elemMatch: { $in: eId } } }
            })
        }


        var count = await PostModel.aggregate([...aggregate, { $count: "total" }])

        aggregate.push({ $skip: skip })
        aggregate.push({ $limit: limit })

        var user = await PostModel.aggregate(aggregate)
        // console.log(aggregate, 'aggregate');


        var newD = await Promise.all(user.map(async (v) => ({
            ...v, //spread
            formattedTime: moment(v.createdAt).fromNow(),
            expertise: await expertiseModel.find({
                _id: { $in: v.expertise }

            }),
            liked: v.likeBy.includes(req.payload._id)
        })))

        var totalPages = Math.ceil(count[0]?.total / limit)

        res.json({
            data: newD,
            totalPages: totalPages,
            currentPage: page,
            nextPage: page + 1 > totalPages ? false : page + 1,
            prevPage: page - 1 >= 1 ? page - 1 : false,
            message: "success",
            status: true
        })

    } catch (error) {
        res.json({
            status: false,
            message: error.message
        });
    }


}




async function likePost(req, res) {
    try {
        var data = req.body;
        var loginUser = req.payload;
        var post = await PostModel.findOne({ _id: data.postId });
        if (!post) {
            res.json({
                status: false,
                message: "post not found"
            })
        }
        if (post.likeBy.includes(loginUser._id)) {
            const index = post.likeBy.indexOf(loginUser._id);
            post.likeBy.splice(index, 1);
            post.save();
            // sendNotification(req.payload._id, "dislike", "unlike");
            res.json({
                status: true,
                like: false,
                message: "like removed"
            })
        }
        else {
            post.likeBy.push(loginUser._id);
            post.save();
            sendNotification(post.userId, {
                message: loginUser.firstName + " Liked Your Post.",
                userId: loginUser._id
            });
            res.json({
                status: true,
                like: true,
                message: "post liked successfully"
            })
        }
    } catch (error) {
        res.json({
            status: false,
            message: error.message
        });
    }

}

async function savePost(req, res) {
    try {
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
            // sendNotification(req.payload._id, "unsaved", "removed");
            res.json({
                status: true,
                save: false,
                message: "post removed"
            })
        }
        else {
            user.savedJob.push(data.postId);
            user.save();
            // sendNotification(req.payload._id, "save", "saved");
            res.json({
                status: true,
                save: true,
                message: "post saved successfully"
            })
        }



    } catch (error) {
        res.json({
            status: false,
            message: error.message
        });
    }

}

async function postDataById(req, res) {
    try {
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

        var proposal = await ProposalModel.findOne({
            postId: post[0]._id,
            userId: req.payload._id
        });

        if (!post || post.length == 0) {
            return res.json({
                status: false,
                message: "post not found"
            })
        }
        console.log(post, 'post');
        var expertise = await expertiseModel.find({
            _id: { $in: post[0]?.expertise }
        })

        var newD = await Promise.all(post.map(async (v) => ({
            ...v, //spread
            formattedTime: moment(v.createdAt).fromNow(),
            expertise: await expertiseModel.find({
                _id: { $in: v.expertise }
            }),
            liked: v.likeBy.includes(req.payload._id)
        })))

        res.json({
            data: {
                ...post[0], expertise: expertise,
                formattedTime: moment(post[0]?.createdAt).fromNow(),
                liked: post[0]?.likeBy.includes(req.payload._id),
                applied: proposal ? true : false
            },
            status: true,
        })
    } catch (error) {
        res.json({
            status: false,
            message: error.message
        });
    }

}

async function saveJobList(req, res) {
    try {
        var currentUser = req.payload._id;
        var user = await UserModel.findOne({ _id: currentUser });

        // console.log(user);

        console.log(user.savedJob);

        var sId = user.savedJob.map(e => new mongoose.Types.ObjectId(e))

        var jobs = await PostModel.aggregate([
            { $match: { _id: { $in: sId } } },
            {
                $lookup: {
                    from: "users",
                    localField: "userId",
                    foreignField: "_id",
                    as: "user"
                }
            }
        ])

        var newD = await Promise.all(jobs.map(async (v) => ({
            ...v, //spread
            formattedTime: moment(v.createdAt).fromNow(),
            expertise: await expertiseModel.find({
                _id: { $in: v.expertise }

            }),
            liked: v.likeBy.includes(req.payload._id)
        })))

        res.json({
            savedPost: newD,
            status: true
        })
    } catch (error) {
        res.json({
            status: false,
            message: error.message
        });
    }

}

async function currentUserPost(req, res) {
    try {
        var currentUser = req.payload._id;
        var postList = await PostModel.find({ userId: currentUser })

        res.json({
            status: true,
            currentUserPost: postList
        })
    } catch (error) {
        res.json({
            status: false,
            message: error.message
        });
    }

}
async function postListByUserId(req, res) {
    try {
        var postList = await PostModel.aggregate([

            { $match: { userId: new mongoose.Types.ObjectId(req.params.id) } },

            {
                $lookup: {
                    from: "users",
                    localField: "userId",
                    foreignField: "_id",
                    as: "user"
                }
            }

        ]); var newD = await Promise.all(postList.map(async (v) => ({
            ...v, //spread
            formattedTime: moment(v.createdAt).fromNow(),
            expertise: await expertiseModel.find({
                _id: { $in: v.expertise }

            }),
            liked: v.likeBy.includes(req.payload._id)
        })))
        res.json({
            status: true,
            data: newD
        });
    } catch (error) {
        res.json({
            status: false,
            message: "An error occurred while fetching post list",
            message: error.message
        });
    }
}


module.exports = {
    post,
    postUpdate,
    postDelete,
    postList,
    likePost,
    savePost,
    postDataById,
    saveJobList,
    currentUserPost,
    postListByUserId
}


const PostModel = require('../models/postModels');
const ProposalModel = require('../models/proposalModels');
const joi = require('joi');
const { sendNotification } = require('./notificationController')

async function proposal(req, res) {
    try {
        var data = req.body;
        const schema = joi.object().keys({
            postId: joi.string().required(),
            description: joi.string().required(),
            bidAmount: joi.number().required(),
            status: joi.string().required()
        })
        var valid = schema.validate(data);

        var user = await ProposalModel.create({ postId: data.postId, userId: req.payload._id, description: data.description, bidAmount: data.bidAmount, status: data.status });
        sendNotification(req.payload._id, "proposal", "new proposal");
        res.json({
            status: true,
            message: "created successfully"
        })
    } catch (error) {
        res.status(500).json({
            status: false,
            error: error.message
        });
    }

}
async function proposalUpdate(req, res) {
    try {
        var data = req.body;
        const schema = joi.object().keys({
            id: joi.string(),
            description: joi.string(),
            postId: joi.string(),
            userId: joi.string(),
            bidAmount: joi.number(),
            status: joi.string()
        })
        var valid = schema.validate(data);
        if (valid?.error) {
            console.log(valid.error.message);
            return res.json({
                status: false,
                error: valid.error.message
            })
        }

        var user = await ProposalModel.updateOne({}, { postId: data.postId, userId: data.userId, description: data.description, bidAmount: data.bidAmount, status: data.status });
        if (user.modifiedCount == 0) {
            res.json({
                status: true,
                message: "updated not successfully"
            })
        }
        else {
            res.json({
                status: true,
                message: "updated successfully"
            })
        }

    } catch (error) {
        res.status(500).json({
            status: false,
            error: error.message
        });
    }


}


async function proposalByPost(req, res) {
    var data = req.query;
    try {

        // Adding Pagination 
        const limitValue = req.query.limit || 3;
        const skipValue = req.query.skip || 0;
        const posts = await ProposalModel.find({ postId: data.postId })
            .limit(limitValue).skip(skipValue);
        res.status(200).send(posts);
    } catch (e) {
        console.log(e);
    }
}

async function proposalAcceptReject(req, res) {
    try {
        var data = req.body;
        var user = await ProposalModel.updateOne({ _id: data.id }, { status: data.status });

        if (user.modifiedCount == 0) {
            res.json({
                status: true,
                message: "status dose not updated"
            })
        }
        else {
            res.json({
                status: true,
                message: "status updated successfully"
            })
        }
    } catch (error) {
        res.status(500).json({
            status: false,
            error: error.message
        });
    }

}


async function proposalByUser(req, res) {
    var data = req.query;
    try {
        // Adding Pagination 
        const limitValue = req.query.limit || 3;
        const skipValue = req.query.skip || 0;
        const posts = await ProposalModel.find({ userId: data.userId })
            .limit(limitValue).skip(skipValue);
        res.status(200).send(posts);
    } catch (e) {
        console.log(e);
    }
}



module.exports = {
    proposal,
    proposalUpdate,
    proposalByPost,
    proposalAcceptReject,
    proposalByUser
}

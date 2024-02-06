const PostModel = require('../models/postModels');
const ProposalModel = require('../models/proposalModels');
const joi = require('joi');

async function proposal(req, res) {
    var data = req.body;
    const schema = joi.object().keys({
        postId: joi.string().required(),
        userId: joi.string().required(),
        description: joi.string().required(),
        bidAmount: joi.number().required(),
        status: joi.string().required()
    })
    var valid = schema.validate(data);

    if (valid?.error) {
        console.log(valid.error.message);
        return res.json({
            error: valid.error.message
        })
    }
    var user = await ProposalModel.create({ postId: data.postId, userId: data.userId, description: data.description, bidAmount: data.bidAmount, status: data.status });

    res.json({
        status: true,
        message: "created successfully"
    })
}
async function proposalUpdate(req, res) {
    var data = req.body;
    const schema = joi.object().keys({
        id : joi.string().required(),
        description: joi.string().required(),
        postId: joi.string().required(),
        userId: joi.string().required(),
        bidAmount: joi.number().required(),
        status: joi.string().required()
    })
    var valid = schema.validate(data);
    if (valid?.error) {
        console.log(valid.error.message);
        return res.json({
            error: valid.error.message
        })
    }
    
    var user = await ProposalModel.updateOne({},{postId :  data.postId , userId : data.userId , description : data.description , bidAmount : data.bidAmount,status : data.status});
    if(user.modifiedCount == 0){
        res.json({
            status : true,
            message : "updated not successfully"
        })     
    }
    else{
        res.json({
            status : true,
            message : "updated successfully"
        })
    }

    
}


async function proposalByPost(req,res) {
    let id = req.query.postId;
    var post = await ProposalModel.find({postId : id})
    .populate("userId");

    const pageNumber = req.query.page || 1; // Get the current page number from the query parameters
    const limit = req.query.limit || 5;
     // Number of items per page


    ProposalModel.paginate({}, { page: pageNumber, limit: limit }, (err, result) => {
        if (err) {
            return res.status(500).json({ message: 'Error occurred while fetching users.' });
        }

        const { docs, total, limit, page, pages } = result;
        res.json({ users: docs, total, limit, page, pages });
    });


    // res.json ({ 
    //     postData : post,
    //     status : true,
    //     message : "record fetch successfully"
    // })
}

async function proposalAcceptReject(req,res) {
        var data  = req.body;
        var user = await ProposalModel.updateOne({ _id : data.id} , {status : data.status});

        if(user.modifiedCount == 0){
            res.json({
                status : true,
                message : "status dose not updated"
            })
        }
        else{
            res.json({
                status : true,
                message : "status updated successfully"
            })
        }
}



module.exports = {
    proposal,
    proposalUpdate,
    proposalByPost,
    proposalAcceptReject
}

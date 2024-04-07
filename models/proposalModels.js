const mongoose = require('mongoose');
const aggregatePaginate = require('mongoose-aggregate-paginate-v2');

var proposalSchema = new mongoose.Schema({
    postId : {
        type : mongoose.Schema.Types.ObjectId,
        require : true,
        ref:"post"
    },
    userId : {
        type : mongoose.Schema.Types.ObjectId,
        require : true,
        ref:"user"
    },
    description : {
        type : String,
        require : true
    },
    bidAmount : {
        type : Number,
        require : true
    },
    status : {
        type : String,
        require : true
    },
    paymentStatus :{
        type : Boolean,
        default : "false",
        require : true
    }
})
proposalSchema.plugin(aggregatePaginate);
const ProposalModel = mongoose.model('proposal' , proposalSchema)
module.exports = ProposalModel;

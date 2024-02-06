const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

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
    }
})
proposalSchema.plugin(mongoosePaginate);
const ProposalModel = mongoose.model('proposal' , proposalSchema)
module.exports = ProposalModel;

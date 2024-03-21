const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    payerId: {
        type: mongoose.Schema.Types.ObjectId,
        require: true,
        ref: "user"
    },
    receiverId : {
        type : Object,
        require : true
    },
    postId : {
        type : String,
        require : true
    },
    proposalId : {
        type : String,
        require : true
    },
    amount : {
        type : Number,
        require : true
    },
    status : {
        type : String,
        default : "pending",
        require : true
    },
    rzp_txz : {
        type : String,
        default : null
    }
},{ timestamps: {} });
const paymentModel = mongoose.model('payment', paymentSchema);
module.exports = paymentModel;
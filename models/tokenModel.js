const mongoose = require('mongoose');

var tokenSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "user",
    },
    token: {    
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 3600,
    },

});
const tokenModel  = mongoose.model('token',tokenSchema);
module.exports = tokenModel;

const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

var postSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        require: true,
        ref: "user"
    },
    description: {
        type: String,
        require: true
    },
    title: {
        type: String,
        require: true
    },
    expertise: {
        type: Array,
        require: true
    },
    budget: {
        type: Number,
        require: true
    },
    status: {
        type: String,
        require: true
    },
    likeBy: {
        type: Array,
        default: [],
        ref: "user"
    }

}, { timestamps: {} })
postSchema.plugin(mongoosePaginate);
const PostModel = mongoose.model('post', postSchema);
module.exports = PostModel;
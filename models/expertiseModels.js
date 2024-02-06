const mongoose = require('mongoose');

var expertiseSchema = new mongoose.Schema({
    postId : {
        type : mongoose.Schema.Types.ObjectId,
        require : true,
        ref : "post"
    },
    technology : { 
        type : String,
        require : true
    }

});
const expertiseModel = mongoose.model('expertise',expertiseSchema);
module.exports = expertiseModel;

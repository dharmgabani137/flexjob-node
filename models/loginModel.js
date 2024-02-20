const mongoose = require('mongoose');

var loginSchema = new mongoose.Schema({
    userId : {
        type : mongoose.Schema.Types.ObjectId,
        require : true,
        ref:"user"
    },
    token : {
        type : String,
        require : true
    }


});
const loginModel = mongoose.model('login',loginSchema);
module.exports = loginModel;
const mongoose = require('mongoose');

var adminSchema = new mongoose.Schema({
    type : { 
        type  : String,
        require : true
    },
    email : {
        type : String,
        require : true
    },
    password : {
        type : Number,
        require : true

    }

});
const adminModel = mongoose.model('admin',adminSchema);
module.exports = adminModel;
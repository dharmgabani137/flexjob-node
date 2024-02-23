const mongoose = require("mongoose");
const mongoosePaginate = require('mongoose-paginate-v2');


// const schema = mongoose.Schema;

var userSchema = new mongoose.Schema({
    type : {
        type : String,
        require : true
    },
    firstName : {   
        type : String,
        require : true
    },
    
    lastName : {
        type : String,
        require : true
    },
    email : {
        type : String,
        require : true
    }, 
    password : {
        type : String,
        require : true
    },
    mobile : {
        type : String,
        require : true
    },
    expertise : {
        type : Array,
        require : true
    },
    // language : {
    //     type : Array,
    //     require : true
    // },
    title : {
        type : String,
        require : true
    },
    description : { 
        type : String,
        require : true
    },
    workHistory : {
        type : Array,
        require : true
    },
    location : {
        type : String,
        require : true
    },
    savedJob : {
        type : Array,
        require : true
    },
    rate : {
        type : Number,
        require : true
    }
})
userSchema.plugin(mongoosePaginate);
const UserModel = mongoose.model('user', userSchema);
module.exports = UserModel;
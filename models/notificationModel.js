const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        require: true,
        ref: "user"
    },
    data : {
        type : Object,
        require : true
    },
    isRead : {
        type : String,
        require : true
    }

},{ timestamps: {} });
const notificationModel = mongoose.model('notification', notificationSchema);
module.exports = notificationModel;
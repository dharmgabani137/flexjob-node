const notificationModel = require('../models/notificationModel');

async function sendNotification(userId,type,message){
    var notification = await notificationModel.create({
        userId: userId,
        data : {
            type : type,
            message : message
        },
        isRead : false
    })
}

module.exports = {
    sendNotification
}
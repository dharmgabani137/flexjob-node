const notificationModel = require('../models/notificationModel');
async function sendNotification(userId, type, message) {
    var notification = await notificationModel.create({
        userId: userId,
        data: {
            type: type,
            message: message
        },
        isRead: false
    })
}

async function notificationList(req, res) {
    var userId = req.query.userId;
    var user = await notificationModel.find({ userId: userId });
    res.json({
        status: true,
        data: user
    })
}

module.exports = {
    sendNotification,
    notificationList
}
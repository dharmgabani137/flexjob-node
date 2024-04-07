const notificationModel = require('../models/notificationModel');
async function sendNotification(userId, data) {
    var notification = await notificationModel.create({
        userId: userId,
        data: data,
        isRead: false
    })
}

async function notificationList(req, res) {
    var userId = req.payload._id;
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
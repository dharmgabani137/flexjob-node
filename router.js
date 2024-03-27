const express = require('express');
const jwt = require("jsonwebtoken");
const loginModel = require("./models/loginModel");
// const UserModel = require("./models/userModels");
// const multer = require('multer');
const { registerPost, login, logout, update, profile, forgetPass, sendEmail, resetPass, employeeDataById } = require('./controller/authController');
const { post, postUpdate, postDelete, postList, likePost, savePost, postDataById, saveJobList, currentUserPost, postListByUserId } = require('./controller/postController');
const { proposal, proposalUpdate, proposalByPost, proposalAcceptReject, proposalByUser } = require('./controller/proposalController');
const { employeeData } = require('./controller/employeeController');
const { employerData } = require('./controller/employerController');
const { seedData, expertiseData } = require('./controller/expertiseController');
const { reviews, reviewList } = require('./controller/reviewsController');
const { notificationList } = require('./controller/notificationController');
const { dashbord, loginPost, loginGet, table, adminData, createData, insertData, updateView, updateData, userDelete, userBlock, adminLogout, jobs, updatepost, updatePostView, createPost, insertPost, paymentView } = require('./controller/homeController');
const { seed } = require('./seed/seed');
const { createOrder, verifyOrder } = require('./controller/paymentController');

const route = express.Router();


// const upload = multer ({
//     storage : multer.diskStorage({
//         destination : function(req , file, cb){
//             cb(null , "public/images")
//         },
//         filename : function (req , file , cb) {
//             const uniqueSuffix = Math.random().toString(36).substring(2,15) + "." + file.mimetype.split('/')[1]
//             cb(null , uniqueSuffix)
//         }
//     })
// });

function adminVerify(req, res, next) {
    if (req.session?.user) {
        return next()
    } else {
        res.redirect('/login-admin')
    }
}


// function verify(req, res, next) {
//     try {
//         const token = req.headers.authorization.split(" ")[1];
//         req.payload = jwt.verify(token, "your_secret_key");
//         next();
//     } catch (error) {
//         res.status(401).json({ message: "No token provided" });
//     }
// }

async function verify(req, res, next) {
    try {
        const token = req.headers.authorization.split(" ")[1];
        const payload = jwt.verify(token, "your_secret_key");
        const validToken = await loginModel.findOne({ token });
        if (!validToken) {
            throw new Error("Invalid token");
        }
        req.payload = payload;

        next();
    } catch (error) {
        res.json({
            status: false,
            message: "Unauthorized: Invalid or expired token"
        });
    }
}


route.post('/register', registerPost);
route.post('/login', login);
route.post('/logout', logout);
route.post('/profile-update', verify, update);
route.get('/profile', verify, profile);

route.post('/post', verify, post);
route.post('/post-update', verify, postUpdate);
route.get('/post-by-id/:id', verify, postDataById);

route.post('/delete', verify, postDelete);
route.post('/proposal', verify, proposal);
route.post('/proposal-update', proposalUpdate);
route.get('/proposal-by-post', proposalByPost);
route.post('/proposal-accept-reject', proposalAcceptReject);
route.get('/post-list', verify, postList);
route.get('/employee-data', employeeData);
route.get('/employer-data', employerData);
route.get('/seed-expertise', seedData);
route.get('/expertise-data', expertiseData);
route.post('/send-email', sendEmail);
route.post('/forget-pass', forgetPass);
route.post('/reset/:userid/:token', resetPass);
route.get('/proposal-by-user', proposalByUser);
route.post('/like', verify, likePost);
route.post('/save-post', verify, savePost);
route.post('/reviews', verify, reviews);
route.get('/notification-list', notificationList);
route.get('/user-by-id/:id', employeeDataById);
route.get('/review-list', verify, reviewList);
route.get('/save-job-list', verify, saveJobList)
route.get('/current-user-post', verify, currentUserPost);
route.get('/post-list-by-user-id/:id', verify, postListByUserId);
route.get('/payment', (req, res) => {
    res.render('payment')
});
route.post('/create-order', verify, createOrder);
route.post('/verify-order', verifyOrder)



route.get('/seed', seed);



route.post('/admin-data', adminData);
route.get('/dashbord', adminVerify, dashbord);
route.get('/login-admin', loginGet);
route.post('/login-admin', loginPost);
route.get('/table', adminVerify, table);
route.get('/jobs', adminVerify, jobs);
route.get('/create-data', adminVerify, createData);
route.post('/insert-data', adminVerify, insertData);
route.get('/update-view', adminVerify, updateView);
route.post('/update-data', adminVerify, updateData);
route.get('/post-delete', adminVerify, postDelete);
route.get('/user-block', adminVerify, userBlock);
route.post('/admin-logout', adminLogout);
route.post('/update-post',adminVerify ,updatepost);
route.get('/update-post-view', adminVerify, updatePostView);
route.get('/create-post',createPost);
route.post('/insert-post',insertPost);
route.get('/payment-view',paymentView);






// change kkkk


module.exports = {
    route
}  
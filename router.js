const express = require('express');
const jwt = require("jsonwebtoken");
const loginModel = require("./models/loginModel");
// const UserModel = require("./models/userModels");
// const multer = require('multer');
const { registerPost, login, logout, update, profile, forgetPass, sendEmail, resetPass, employeeDataById } = require('./controller/authController');
const { post, postUpdate, postDelete, postList , likePost, savePost, postDataById} = require('./controller/postController');
const { proposal, proposalUpdate, proposalByPost, proposalAcceptReject, proposalByUser } = require('./controller/proposalController');
const { employeeData } = require('./controller/employeeController');
const { employerData } = require('./controller/employerController');
const { seedData, expertiseData } = require('./controller/expertiseController');
const { reviews } = require('./controller/reviewsController');
const { sendNotification } = require('./controller/notificationController');
const { dashbord, loginPost, loginGet, table, adminData, createData, insertData, updateView, updateData, userDelete, userBlock } = require('./controller/homeController');

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

// function verify(req, res, next) {
//     if (req.session?.user) {
//         return next()
//     } else {
//         res.json({
//             status: false,
//             message: "Unauthenticated."
//         })
//     }
// }


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
        res.status(401).json({ message: "Unauthorized: Invalid or expired token" });
    }
}


route.post('/register', registerPost);
route.post('/login', login);
route.post('/logout', logout);  
route.post('/profile-update', verify, update);
route.get('/profile', verify, profile);
route.post('/post', verify, post);
route.post('/post-update', verify, postUpdate);
route.post('/delete', verify, postDelete);
route.post('/proposal',verify,proposal);
route.post('/proposal-update', proposalUpdate);
route.get('/proposal-by-post',proposalByPost);
route.post('/proposal-accept-reject', proposalAcceptReject);
route.get('/post-list', verify,postList);
route.get('/employee-data', employeeData);
route.get('/employer-data', employerData);
route.get('/seed-expertise', seedData);
route.get('/expertise-data', expertiseData);
route.post('/send-email', sendEmail);
route.post('/forget-pass', forgetPass);
route.post('/reset/:userid/:token', resetPass);
route.get('/proposal-by-user', proposalByUser);
route.post('/like', verify,likePost);
route.post('/save-post',verify,savePost);
route.post('/reviews',verify,reviews);
route.get('/sendNotification',sendNotification);
route.get('/user-by-id/:id',employeeDataById);
route.get('/post-by-id/:id',postDataById);
route.post('/admin-data',adminData);







route.get('/dashbord',dashbord);
route.get('/login-admin',loginGet);
route.post('/login-admin',loginPost);
route.get('/table',table);
route.get('/create-data',createData);
route.post('/insert-data',insertData);
route.get('/update-view',updateView);
route.post('/update-data',updateData);
route.get('/user-delete',userDelete);
route.get('/user-block',userBlock);



// change kkkk


module.exports = {
    route
}  
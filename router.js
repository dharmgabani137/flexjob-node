const express = require('express');
// const multer = require('multer');
const { registerPost, login, logout, update, getRequest, forgetPass , sendEmail , resetPass} = require('./controller/authController');
const { post, postUpdate, postDelete, postList } = require('./controller/postController');
const { proposal, proposalUpdate, proposalByPost, proposalAcceptReject } = require('./controller/proposalController');
const { employeeData } = require('./controller/employeeController');
const { employerData } = require('./controller/employerController');
const { seedData, expertiseData } = require('./controller/expertiseController');

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

function verify(req, res, next) {
    if (req.session?.user) {
        return next()
    } else {
        res.json({
            status: false,
            message: "Unauthenticated."
        })
    }
}


route.post('/register', registerPost);
route.post('/login', login);
route.post('/logout', logout);
route.post('/profile-update', verify, update);
route.get('/profile', verify, getRequest);
route.post('/post', verify, post);
route.post('/post-update', verify, postUpdate);
route.post('/delete', verify, postDelete);
route.post('/proposal', proposal);
route.post('/proposal-update', proposalUpdate);
route.get('/proposal-by-post', proposalByPost);
route.post('/proposal-accept-reject', proposalAcceptReject);
route.get('/post-list', postList);
route.get('/employee-data', employeeData);
route.get('/employer-data', employerData);
route.get('/seed-expertise', seedData);
route.get('/expertise-data',expertiseData);
route.post('/send-email', sendEmail);
route.post('/forget-pass',forgetPass);
route.post('/reset/:userid/:token', resetPass);


// change kkkk


module.exports = {
    route
}  
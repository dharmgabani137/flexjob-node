const UserModel = require("../models/userModels");
const adminModel = require("../models/adminModel");
const joi = require('joi');
const bcrypt = require('bcrypt');
const nodemailer = require("nodemailer");
const crypto = require('crypto');
const PostModel = require("../models/postModels");
var session = require('express-session');
const expertiseModel = require("../models/expertiseModel");
const paymentModel = require("../models/paymentModel");
var MongoDBStore = require('connect-mongodb-session')(session);


async function adminData(req, res) {
    try {
        var data = req.body;

        var user = await adminModel.create({ type: data.type, email: data.email, password: data.password });

        res.json({
            message: "added",
            data: user,
            status: true

        })

    } catch (error) {
        res.json({
            status: false,
            message: error.message
        });
    }

}

async function dashbord(req, res) {
    try {
        var userCount = await UserModel.find({});
        var postCount = await PostModel.find({});
        userTotal = userCount.length;
        postTotal = postCount.length;

        res.render('dashbord', { userTotal, postTotal });
    } catch (error) {
        res.json({
            status: false,
            message: error.message
        });
    }

}

function loginGet(req, res) {
    res.render('pages/login', { layout: "layout/authlayout/authlayout" })
}
async function loginPost(req, res) {
    try {
        let data = req.body;
        var user = await adminModel.findOne({
            email: data.email,
            password: data.password,
            type: "admin"
        });
        console.log(user, "userlist....................");
        // req.session.user = user;
        // console.log(req.session.user, "user session ..........................");

        if (user == null) {
            res.redirect("/login-admin");

        } else {
            req.session.user = user
            res.redirect("/dashbord");
        }
    } catch (error) {
        res.json({
            status: false,
            message: error.message
        });
    }

}

async function table(req, res) {
    var user = await UserModel.find({});
    res.render('table', { user })
}
async function jobs(req, res) {
    var user = await PostModel.find({});
    var newD = await Promise.all(user.map(async (v) => ({
        ...v._doc, //spread
        // formattedTime: moment(v.createdAt).fromNow(),
        expertise: await expertiseModel.find({
            _id: { $in: v.expertise }

        })
    })))
    
    res.render('jobs', { newD })
}
async function createData(req, res) {
    res.render('createData')
}
async function insertData(req, res) {
    try {
        var data = req.body;
        console.log(data);
        // Check if the 'password' field is present in the request data
        if (!data.password) {
            return res.json({
                status: false,
                message: 'Password is required'
            });
        }



        const hashedPassword = await bcrypt.hash(data.password, 10);
        var checkEmail = await UserModel.findOne({ email: data.email });
        var user = await UserModel.create({
            type: data.type,
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            password: hashedPassword,
            mobile: data.mobile,
            //       //  // language: data.language,
            title: data.title,
            description: data.description,
            // workHistory: data.workHistory,
            location: data.location,
            // savedJob: data.savedJob,
            rate: data.rate,
            // img : '/img/C:\Users\Janvi\Pictures\Screenshots'
        })
        res.redirect('/table')

    } catch (error) {
        res.json({
            status: false,
            message: error.message
        });
    }

}

async function updateView(req, res) {

    var user = await UserModel.findOne({ _id: req.query.id });
    res.render('updateview', { user })
    
}
async function updateData(req, res) {
    try {
        var data = req.body;
        const hashedPassword = await bcrypt.hash(data.password, 10);
        var user = await UserModel.updateOne({ _id: data.id }, {
            type: data.type,
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            password: hashedPassword,
            mobile: data.mobile,
            //       //  // language: data.language,
            title: data.title,
            description: data.description,
            // workHistory: data.workHistory,
            location: data.location,
            // savedJob: data.savedJob,
            rate: data.rate,
        })
        
        res.redirect('/table')
    } catch (error) {
        res.json({
            status: false,
            message: error.message
        });
    }

}
async function userBlock(req, res) {
    if (req.query.userBlock === 'true') {
        var blockUser = await UserModel.updateOne({ _id: req.query.id }, {
            userBlock: false
        });
    } else {
        var blockUser = await UserModel.updateOne({ _id: req.query.id }, {
            userBlock: true
        });
    }
    res.redirect('/table')
}

async function adminLogout(req, res) {
    req.session.user = null;
    res.redirect('/login-admin')
}
// --------------------------------------------------------------------------------------------------------------------------
async function adminPostDelete(req, res) {
    var deleteUser = await PostModel.deleteOne({ _id: req.query.id });
    console.log(deleteUser);
    res.redirect('/jobs')
}
async function updatePostView(req, res) {

    var user = await PostModel.findOne({ _id: req.query.id });
    res.render('updatePostView', { user })
}
async function updatepost(req, res) {
    try {
        var data = req.body;
        var user = await PostModel.updateOne({ _id: data.id },
            {
                description: data.description,
                title: data.title,
                // expertise: data.expertise,
                budget: data.budget,
            });
            console.log(data.id);
        res.redirect('/jobs')
    } catch (error) {
        res.json({
            status: false,
            message: error.message
        });
    }

}
async function createPost(req, res) {
    var user = await UserModel.find({});
    res.render('createPost',{user})
}
async function insertPost(req, res) {
    try {
        var data = req.body;
        var user = await PostModel.create({ userId : data.userId,description: data.description, title: data.title, budget: data.budget });
        console.log(data);
        // res.json({
        //     status: true,
        //     message: "created successfully"
        // })
        res.redirect('/jobs')
    } catch (error) {
        res.json({
            status: false,
            message: error.message
        });
    }

}
//---------------------------------------------------------------------------------------------
async function paymentView(req, res) {
    const payment = await paymentModel.aggregate([
        // { $match: { postId: new mongoose.Types.ObjectId(req.query.postId) } },
        {
            $lookup: {
                from: "posts",
                localField: "postId",
                foreignField: "_id",
                as: "post"
            }
        }
    ])
    console.log(payment[0]);
    res.render('paymentView', { user: payment })
}



module.exports = {
    dashbord,
    loginGet,
    loginPost,
    table,
    adminData,
    createData,
    insertData,
    updateView,
    updateData,
    adminPostDelete,
    userBlock,
    adminLogout,
    jobs,
    updatepost,
    updateView,
    updatePostView,
    insertPost,
    createPost,
    paymentView,

}
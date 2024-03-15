const UserModel = require("../models/userModels");
const adminModel = require("../models/adminModel");
const joi = require('joi');
const bcrypt = require('bcrypt');
const nodemailer = require("nodemailer");
const crypto = require('crypto');
const PostModel = require("../models/postModels");
var session = require('express-session');
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
        res.status(500).json({
            status: false,
            error: error.message
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
        res.status(500).json({
            status: false,
            error: error.message
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
        res.status(500).json({
            status: false,
            error: error.message
        });
    }
    
}

async function table(req, res) {
    var user = await UserModel.find({});
    res.render('table', { user })
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
    if (checkEmail == null) {
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
        console.log(user);
        res.json({
            status: true,
            message: 'register successfully'
        });
    }
    else {
        res.json({
            status: false,
            message: 'user already exists'
        })
    }

    } catch (error) {
        res.status(500).json({
            status: false,
            error: error.message
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
        res.status(500).json({
            status: false,
            error: error.message
        });
    }
    
}
async function userDelete(req, res) {
    var deleteUser = await UserModel.deleteOne({ _id: req.query.id });
    console.log(deleteUser);
    res.redirect('/table')
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
    userDelete,
    userBlock,
    adminLogout

}
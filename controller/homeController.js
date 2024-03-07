const UserModel = require("../models/userModels");
const adminModel = require("../models/adminModel");


async function adminData(req,res) {
    var data = req.body;

    var user = await adminModel.create({type : data.type,email : data.email,password : data.password});

    res.json({
        message  : "added",
        data : user 
    })

}

function dashbord(req, res) {
    res.render('dashbord')
}

function loginGet(req, res) {
    res.render('pages/login', { layout: "layout/authlayout/authlayout" })
}
async function loginPost(req, res) {
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
        res.redirect("/dashbord");
    }
}

async function table(req, res) {
    var user = await UserModel.find({});
    res.render('table', { user })
}

module.exports = {
    dashbord,
    loginGet,
    loginPost,
    table,
    adminData

}
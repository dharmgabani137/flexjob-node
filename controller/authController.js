const UserModel = require("../models/userModels");
const tokenModel = require("../models/tokenModel");
const loginModel = require("../models/loginModel");
const reviewsModel = require('../models/reviewsModel');
const jwt = require('jsonwebtoken');
const joi = require('joi');
const bcrypt = require('bcrypt');
const nodemailer = require("nodemailer");
const crypto = require('crypto');
var fs = require('fs');
const { start } = require("repl");





async function registerPost(req, res) {
    try {
        var data = req.body;
        // Check if the 'password' field is present in the request data
        if (!data.password) {
            return res.json({
                status: false,
                message: 'Password is required'
            });
        }

        const schema = joi.object().keys({
            type: joi.string(),
            firstName: joi.string().alphanum().min(3).max(30),
            lastName: joi.string().alphanum().min(3).max(30),
            email: joi.string().email(),
            password: joi.string().pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')),
            mobile: joi.string().regex(/^[0-9]{10}$/),
            expertise: joi.array(),
            // language: joi.array().required(),
            title: joi.string(),
            description: joi.string(),
            workHistory: joi.array(),
            location: joi.string(),
            savedJob: joi.array(),
            rate: joi.string()
        });

        const hashedPassword = await bcrypt.hash(data.password, 10);
        var valid = schema.validate(data);


        if (valid?.error) {
            console.log(valid.error.message);
            return res.json({
                error: valid.error.message,
                status: false
            })
        }

        var checkEmail = await UserModel.findOne({ email: data.email });
        if (checkEmail == null) {
            var user = await UserModel.create({
                type: data.type,
                firstName: data.firstName,
                lastName: data.lastName,
                email: data.email,
                password: hashedPassword,
                mobile: data.mobile,
                expertise: data.expertise,
                // language: data.language,
                title: data.title,
                description: data.description,
                workHistory: data.workHistory,
                location: data.location,
                savedJob: data.savedJob,
                rate: data.rate,
                img: '/avatar.jpg'
            })

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

async function login(req, res) {
    try {
        var data = req.body;
        var user = await UserModel.findOne({ email: data.email });
        console.log(user);

        if (user == null) {
            return res.json({
                status: false,
                message: 'invalid emailId'
            })
        }
        const passwordMatch = await bcrypt.compare(data.password, user.password);
        if (user.userBlock) {
            return res.status(500).json({
                status: false,
                message: 'you are blocked'
            });
        }

        if (passwordMatch) {

            const token = jwt.sign({
                _id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                password: user.Password,
                mobile: user.mobile,
                expertise: user.expertise,
                title: user.title,
                description: user.description,
                workHistory: user.workHistory,
                location: user.location,
                savedJob: user.savedJob,
                rate: user.rate,
            }, 'your_secret_key', { expiresIn: '1w' });
            await loginModel.create({ userId: user._id, token: token });
            return res.json({
                status: true,
                token: token,
                message: 'Login successful'
            });

        } else {
            return res.json({
                status: false,
                message: 'Invalid email or password'
            });
        }
    } catch (error) {
        res.status(500).json({
            status: false,
            error: error.message
        });
    }

}

// function logout(req, res) {
//     req.session.user = null;
//     res.json({
//         status: true,
//         message: 'logout successfully'
//     })
// }
async function logout(req, res) {
    try {
        const token = req.headers.authorization.split(" ")[1]; // Extract token from headers
        await loginModel.deleteOne({ token }); // Delete the token from the database
        res.json({
            status: true,
            message: 'Logout successfully'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: false,
            message: 'Internal server error'
        });
    }
}

async function profile(req, res) {
    try {
        // var currentUser = req.session.user;
        var user = await UserModel.findOne({ _id: req.payload._id }, { 'firstName': 1, 'lastName': 1, 'email': 1, 'mobile': 1, 'expertise': 1, 'language': 1, 'title': 1, 'description': 1, 'workHistory': 1, 'location': 1, 'savedJob': 1, 'rate': 1, 'img': 1 });
        var createLink = "http://127.0.0.1:4000" + user.img;
        var reviews = await reviewsModel.find({ userId: req.payload._id });
        var avarageReview = 0;
        reviews.forEach(element => {
            avarageReview += ((element.star) / reviews.length);
        });

        res.json({
            userData: { ...user._doc, link: createLink, avarageReview: avarageReview },
            reviews: reviews,
            status: true,
        })
    } catch (error) {
        res.status(500).json({
            status: false,
            error: error.message
        });
    }


}

async function update(req, res) {
    try {
        const userId = req.payload._id;
        var data = req.body;
        console.log(data);
        const schema = joi.object().keys({
            firstName: joi.string().alphanum().min(3).max(30),
            lastName: joi.string().alphanum().min(3).max(30),
            // email: joi.string().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } }),
            password: joi.string().pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')),
            mobile: joi.string().regex(/^[0-9]{10}$/),
            expertise: joi.array(),
            title: joi.string(),
            description: joi.string(),
            // workHistory: joi.array(),
            image: joi.allow(),
            location: joi.string(),
            // savedJob: joi.array(),
            rate: joi.string()
        });
        var valid = schema.validate(data);
        if (valid?.error) {
            return res.json({
                error: valid.error.message,
                status: false
            })
        }

        //     return res.status(400).json({ message: 'No files were uploaded.' });
        // }

        // The name of the input field (e.g. "avatar") is used to retrieve the uploaded file



        if (req.files?.image) {
            let uploadedFile = req.files.image;
            {
                var img = '/img/' + req.payload.firstName + new Date().getTime() + "." + uploadedFile.mimetype.slice(6)

                // Use the mv() method to place the file somewhere on your server'
                uploadedFile.mv('./public' + img, function (err) {
                    if (err) return res.status(500).send(err);
                    // File uploaded successfully
                });
                data.img = img
            }
            var findUser = await UserModel.findOne({ _id: req.payload._id });
            if (findUser.img) {
                fs.unlink('./public' + findUser.img, (err) => {
                    if (err) {
                        console.error(err);
                        return;
                    }
                    console.log('File deleted successfully');
                });
            }
        }





        var user1 = await UserModel.updateOne({ _id: userId }, data);


        if (user1.modifiedCount == 0) {
            res.json({
                status: false,
                message: "not updated"
            })
        }
        else {
            res.json({
                status: true,
                message: 'update successfully'
            })
        }
    } catch (error) {
        res.json({
            status: false,
            error: error.message
        });
    }

};

async function sendEmail(email, subject, text) {
    try {
        const transporter = nodemailer.createTransport({
            host: "sandbox.smtp.mailtrap.io",
            // service: process.env.SERVICE,
            port: 2525,
            auth: {
                user: "aad4eed98d6747",
                pass: "9ad860e39d32be",
            },
        });
        await transporter.sendMail({
            from: "dharmgabani6@gmail.com",
            to: email,
            subject: subject,
            text: text,
        });
    } catch (error) {
        res.status(500).json({
            status: false,
            error: error.message
        });
    }


}

async function forgetPass(req, res) {
    try {
        const schema = joi.object({ email: joi.string().email().required() });
        const { error } = schema.validate(req.body);
        if (error) return res.status(400).send(error.details[0].message);

        const user = await UserModel.findOne({ email: req.body.email });
        if (!user)
            return res.status(400).send("user with given email doesn't exist");

        let token = await tokenModel.findOne({ userId: user._id });
        if (!token) {
            token = await new tokenModel({
                userId: user._id,
                token: crypto.randomBytes(32).toString("hex"),
            }).save();
        }

        const link = `http://127.0.0.1:3000/reset/${user._id}/${token.token}`;
        await sendEmail(user.email, "Password reset", link);

        res.json({
            status: true,
            message: "password reset link sent to your email account"
        });
    } catch (error) {
        res.json({
            status: false,
            message: "An error occured"
        });
        console.log(error);
    }
}

async function resetPass(req, res) {
    try {
        console.log(req.body);
        const schema = joi.object({ password: joi.string().required() });
        const { error } = schema.validate(req.body);


        if (error) return res.json({
            message: error.details[0].message,
            status: false
        });


        const user = await UserModel.findById(req.params.userid);
        console.log(user);
        if (!user) return res.json({
            message: "invalid link or expired",
            status: false
        });
        console.log(user, 'user');
        const token = await tokenModel.findOne({
            userId: user._id,
            token: req.params.token,
        });
        console.log(token, 'token');
        if (!token) return res.json({
            message: "invalid link or expired",
            status: false
        });

        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        user.password = hashedPassword;
        await user.save();
        // await token.delete();

        res.json({
            message: "password reset sucessfully.",
            status: true
        });
    } catch (error) {
        res.json({
            message: "An error occured",
            status: false
        });
        console.log(error);
    }
}


async function employeeDataById(req, res) {
    try {

        var user = await UserModel.findOne({ _id: req.params.id });
        res.json({
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



module.exports = {
    registerPost,
    login,
    logout,
    profile,
    update,
    sendEmail,
    forgetPass,
    resetPass,
    employeeDataById
}

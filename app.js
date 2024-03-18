const express = require('express');
const bodyParser = require("body-parser")
const Razorpay = require("razorpay")
const { route } = require('./router')
const mongoose = require('mongoose');
var expressLayouts = require('express-ejs-layouts');
const session = require('express-session');
var MongoDBStore = require('connect-mongodb-session')(session);
const cors = require("cors");
const fileUpload = require('express-fileupload');
const app = express();
const dbUrl = 'mongodb://127.0.0.1:27017/user';
mongoose.connect(dbUrl, { useNewUrlParser: true, useUnifiedTopology: true });

app.use(session({
    secret: 'SECRET KEY',
    resave: true,
    saveUninitialized: true,
    store: new MongoDBStore({
        uri: dbUrl, //YOUR MONGODB URL
        collection: 'session'
    }),
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 6
    }
}))

app.use(expressLayouts)
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(cors({
    origin: "*",
    credentials: true,
}));

app.use(express.static('public'))

app.use(fileUpload({
    useTempFiles: true,
    tempFileDir: '/public/img/'
}));

app.set("view engine", "ejs")
app.set('layout', 'layout/layout')
app.use('/', route);

const razorpayInstance = new Razorpay({

    // Replace with your key_id 
    key_id: "rzp_test_GFjWtFrV9orbTZ",

    // Replace with your key_secret 
    key_secret: "o46HMxP3jIjxadoddMDLsLgA"
});

//Inside app.js 
app.post('/createOrder', (req, res) => {

    // STEP 1: 
    const { amount, currency, receipt, notes } = req.body;

    // STEP 2:	 
    razorpayInstance.orders.create({ amount, currency, receipt, notes },
        (err, order) => {

            //STEP 3 & 4: 
            if (!err)
                res.json(order)
            else
                res.send(err);
        }
    )
});

//Inside app.js 
app.post('/verifyOrder', (req, res) => {

    // STEP 7: Receive Payment Data 
    const { order_id, payment_id } = req.body;
    const razorpay_signature = req.headers['x-razorpay-signature'];

    // Pass yours key_secret here 
    const key_secret = "YAEUthsup8SijNs3iveeVlL1";

    // STEP 8: Verification & Send Response to User 

    // Creating hmac object 
    let hmac = crypto.createHmac('sha256', key_secret);

    // Passing the data to be hashed 
    hmac.update(order_id + "|" + payment_id);

    // Creating the hmac in the required format 
    const generated_signature = hmac.digest('hex');


    if (razorpay_signature === generated_signature) {
        res.json({ success: true, message: "Payment has been verified" })
    }
    else
        res.json({ success: false, message: "Payment verification failed" })
});



app.listen(4000, e => {
    console.log('server is running');
})


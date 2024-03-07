const express = require('express');
const bodyParser = require("body-parser")
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

app.listen(4000, e => {
    console.log('server is running');
})


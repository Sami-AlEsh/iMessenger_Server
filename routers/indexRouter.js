const express = require('express');
// const bodyParser = require('body-parser');
const uuidv1 = require('uuid/v1');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const mail = require('../utils/mail.utils');
const response = require('../shared/responseForm');

const users = require('../utils/users.utils');

const rateLimit = require("express-rate-limit");

const limiterOpts = rateLimit({
    windowMs: 10 * 60 * 1000, // 15 minutes
    max: 2,
    message : {
        errors: 'Too Many Reqs, Please Try Again In A While ... ',
        status: false,
        data: null
    }
});


let router = express.Router();
//TODO : Could Be App.use in main.js

// router.use(bodyParser.json());



// login -> post
// signup -> post
// logout -> get
// search -> post
// forgetPassword -> post



// store to users file
/*
    {
        id: value,              // generate automaticly, unique
        username: value,        // unique, require
        nickname: value,        // = username if not provided by user
        password: value,        // actual value, require
        email: value,           // unique , require
        status: value,          // string
        date: value, 
        friendsNum: value,
        groupsNum: value,
        friends: value,         // array of ids
        groups: value,          // array of ....
        private_public: value,  // boolean, default false
    }

*/
router.post('/signup', (req, res, next) => {
    console.log('signup route');
    
    if(!req.body.username || !req.body.password || !req.body.email){
        res.statusCode = 400;
        res.end('some information missing from request (username OR password OR email).');
        console.log('ERROR: missing info');
        
        next(); // error
    }

    let user = {
        id: uuidv1(),
        username: req.body.username,
        password: req.body.password,
        email: req.body.email,
        nickname: req.body.nickname === undefined ? req.body.username : req.body.nickname,
        status: req.body.status === undefined ? '' : req.body.status,
        private: req.body.private === undefined ? false : req.body.private,
        friendsNum: 0,
        groupsNum: 0,
        friends: [],
        groups: [],
        signupData: new Date(),
        // Need Handling
        verified : false ,
        generatedCode: null
    }
    
    let result = users.addUser(user);
    //*****************************************************************************************/
    //**                                Add json web token                                    */
    //*****************************************************************************************/

    if(result.err != null){
        result.token = null
        res.statusCode = 400;
    }
    else{
        let secretKey = fs.readFileSync('./secretKey.key').toString();
        let payload = {
            username: user.username,
            userID: user.id,
        };
        let token = jwt.sign(payload, secretKey)
        result.token = token;
        res.statusCode = 200;
    }
    mail.verificationMail(user.username, user.email, user.generatedCode)
        .then((res) => {
            console.log(res);
        })
        .catch((err) => {
            console.log(err);
        });

    console.log('- ', result);

    //New Response Form Example :
    response.data = result;
    response.status = true ;
    response.errors = null;
    //Then Send its with : res.json (response)   /-|*__*|-\
    
    res.setHeader('Content-Type', 'application/json');
    res.json(result);
    next();
});

//-----------------------------------------------------


//-----------------------------------------------------

router.post('/login',limiterOpts ,  (req, res, next) => {
    let exist = users.login(req.body.username, req.body.password);

    res.setHeader('Content-Type', 'application/json');
    if(exist){
        let secretKey = fs.readFileSync('./secretKey.key').toString();
    
        let payload = {
            username: req.body.username,
            date: new Date(),
        };

        let token = jwt.sign(payload, secretKey)


        response.status = true ;
        response.data = {"login": true, "token":token};
        response.errors = null;
        res.statusCode = 200;
        res.json(response);
    }
    else{
        response.status = false ;
        response.data = null;
        response.errors = {"login": false};
        res.statusCode = 404;
        res.json(response);
    }
    next();
});

router.get('/logout', (req, res, next) => {

    //fs.writeFileSync('image.png', req.body, 'binary');
    //console.log('<<<<<<<<<<< body written >>>>>>>>>>')
    console.log(req);
    response.status = true ;
    response.data = {logout: true};
    response.errors = null;
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json(response);
    next();
});

router.post('/search', limiterOpts ,(req, res, next) => {
    console.log(req.body.username);
    console.log(req.body.email);

    response.status = true ;
    response.data = {search: true};
    response.errors = null;
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json(response);
    next();
});



module.exports = router;

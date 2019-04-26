const express = require('express');
const bodyParser = require('body-parser');
const uuidv1 = require('uuid/v1');
const jwt = require('jsonwebtoken');
const fs = require('fs');

const users = require('../utils/users.utils');


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
        signupData: new Date()
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

    console.log('- ', result);

    
    res.setHeader('Content-Type', 'application/json');
    res.json(result);
    next();
});

//-----------------------------------------------------


//-----------------------------------------------------

router.post('/login', (req, res, next) => {
    let exist = users.login(req.body.username, req.body.password);

    res.setHeader('Content-Type', 'application/json');
    if(exist){
        let secretKey = fs.readFileSync('./secretKey.key').toString();
    
        let payload = {
            username: req.body.username,
            date: new Date(),
        };

        let token = jwt.sign(payload, secretKey)


        res.statusCode = 200;
        res.json({"login": true, "token":token});
    }
    else{
        res.statusCode = 404;
        res.json({"login": false});
    }
    next();
});

router.get('/logout', (req, res, next) => {

    //fs.writeFileSync('image.png', req.body, 'binary');
    //console.log('<<<<<<<<<<< body written >>>>>>>>>>')
    console.log(req);
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json({"logout": true});
    next();
});

router.post('/search', (req, res, next) => {
    console.log(req.body.username);
    console.log(req.body.email);
    
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json({"search": true});
    next();
});



module.exports = router;

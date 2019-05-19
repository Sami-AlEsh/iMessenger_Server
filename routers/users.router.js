var express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs')
var router = express.Router();
const usersUtils = require('../utils/users.utils');
const response = require('../shared/responseForm');


// router.use(bodyParser.json());
//GET User Info
// router.get('/:userId', (req, res) => {
//  let userId = req.params['userId'];
//  // TODO : Read user file
// });

// // Search For User Using His userName
router.get('/search/:user', (req, res) => {
  let user = req.params['user'];
  let result = usersUtils.searchForUser(user);
  if(result) {
      response.data = {userInfo : result.username};
      response.status = true ;
      response.errors = null;
   res.status(200).json(response);
  }
  else {
      response.data =  null;
      response.status = false ;
      response.errors = {userInfo: null};
   res.status(200).json(response);
  }
});


router.get('/friends/:user', (req, res) => {
    let reqUser = req.params['user'];
    let currentUser = usersUtils.searchForUser(reqUser);
    console.log(currentUser);
    if(currentUser){
        console.log(currentUser);
        response.data = {friends: currentUser.friends }  ;
        response.status = true ;
        response.errors = null;
        res.status(200).json(response);
    }else {
        response.data = null ;
        response.status = false ;
        response.errors = {friends: null};
        res.status(200).json(response);
    }
})


router.post('/addFriend',(req,res)=>{
 let currUser= req.body.curr;
 let userFriend= req.body.friend;
 if(usersUtils.addFriend(currUser, userFriend)) {
  // TODO: RESponse
     response.data = {status: 1} ;
     response.status = true ;
     response.errors = null;
  res.status(200).json(null);
 }else
     response.data = null ;
    response.status = false ;
    response.errors = {status: -1};
    res.status(200).json(response);
});

// router.post('/login', (req, res) => {
//
// });
//
// router.post('/register', (req, res) => {
//
// });
//
// router.post('/forgetPass', (req, res) => {
//
// });
//
// router.get('/search/:username', (req, res) => {
//
// });

//Get All Users ...
router.get('/users', (req, res, next) => {
 fs.readFile('./storage/users.json', (err, data) => {
  if(!err){
   try{
    res.json(JSON.parse(data.toString()));
   }catch(e){
    console.log('- ', e.message);
   }

  }
  else{
   console.log(err);
  }
 })
});

module.exports = router;

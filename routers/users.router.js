var express = require('express')
var router = express.Router();
const usersUtils = require('utils/users.utils');

//GET User Info
router.get('/:userId', (req, res) => {
 let userId = req.params['userId'];
 // TODO : Read user file
});

// Search For User Using His userName
router.get('/search/:user', (req, res) => {
  let user = req.params['user'];
  let result = usersUtils.searchForUser(user);
  if(result) {
   res.status(200).json({userInfo : result.username})
  }
  else {
   res.status(200).json({userInfo: null});
  }
});


router.post('/addFriend',(req,res)=>{
 let currUser= req.body.curr;
 let userFriend= req.body.friend;
 if(usersUtils.addFriend(currUser, userFriend)) {
  // TODO: RESponse
  res.status(200).json({status : 1});
 }
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

router.get('/search/:username', (req, res) => {

});

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

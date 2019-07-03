const fs = require('fs');
const net = require('net');
const express = require('express');
const router = express.Router();
const usersUtils = require('../utils/users.utils');
const response = require('../shared/responseForm');
const rateLimit = require('../shared/limiterOpts').rateLimit;
const os = require('os');
const ifaces = os.networkInterfaces();
const authMiddlware = require('../middlewares/auth.middleware');


const limiterOpts = rateLimit(1000, 1000);



router.get('/search/:user', limiterOpts, (req, res, next) => {
    let user = req.params['user'];
    let result = usersUtils.searchForSimilirUsers(user);
    
    response.data = result;
    response.status = true ;
    response.errors = null;
    res.json(response);
});

router.get('/friends/:user', limiterOpts, (req, res, next) => {
    let reqUser = req.params['user'];
    let currentUser = usersUtils.searchForUser(reqUser);
    if(!currentUser) return next(new Error('wrong username'));

    response.data = currentUser.friends;
    response.status = true ;
    response.errors = null;
    res.json(response);
    
});


router.get('/blockedUsers/:user', limiterOpts, (req, res, next) => {
    let reqUser = req.params['user'];
    let currentUser = usersUtils.searchForUser(reqUser);
    if(!currentUser) return next(new Error('wrong usrename'));

    response.data = currentUser.blockedUsers;
    response.status = true;
    response.errors = null;
    res.json(response);
});


router.post('/addFriend', limiterOpts, (req, res, next) => {
       
    let currUser= req.body.current;
    let userFriend= req.body.friend;
    let result = usersUtils.addFriend(currUser, userFriend)
    if(result.status === false ) return next(new Error(result.error));
    // TODO: data must be empty
    //-----------------------------------
    let sock = new net.Socket();
    sock.connect(3001, () => {
        let _msg = {type:'new friend', from:currUser, to:userFriend};
        let msg = Buffer.from(JSON.stringify(_msg));
        let msgLen = Buffer.alloc(4);
        msgLen.writeUInt32LE(msg.length);

        sock.write(msgLen); sock.write(msg);

        response.data = null ;
        response.status = true ;
        response.errors = null;
        res.json(response);
        
        sock.end();
    });
    //-----------------------------------
   
});

router.get('/lastSeen/:user', limiterOpts, async (req, res, next) => {
    username = req.params['user'];
    let result = await usersUtils.getUserLastSeen(username);
    if(!result) return next(new Error('wrong username'));

    response.status = true;
    response.errors = null;
    response.data = result;

    res.json(response);
});

router.post('/blockUser',(req, res, next) => {
    let blockingResult = usersUtils.blockUser(req.body.username, req.body.block);
    if(blockingResult) {
      response.status = true;
      response.errors = null;
      response.data = null;
      res.json(response);
    } else {
      next(new Error ('User Not Found !'));
    }
});
  
router.post('/unBlockUser',(req, res, next) => {
    let unBlockingResult = usersUtils.unBlockUser(req.body.username, req.body.unblock);
    if(unBlockingResult) {
      response.status = true;
      response.errors = null;
      response.data = null;
      res.json(response);
    } else {
      next(new Error ('User Not Found !'));
    }
});
  
router.post('/delete', (req,res,next) => {
    console.log(req.body);
    let deleteRes =  usersUtils.deleteUser(req.body.username, req.body.delete);
    if(deleteRes){

        let sock = new net.Socket();
        sock.connect(3001, () => {
            let _msg = {type:'delete friend', from:username };
            let msg = Buffer.from(JSON.stringify(_msg));
            let msgLen = Buffer.alloc(4);
            msgLen.writeUInt32LE(msg.length);

            sock.write(msgLen); sock.write(msg);

            response.data = null ;
            response.status = true ;
            response.errors = null;
            res.json(response);

            sock.end();
        });
        //
        // response.status = true;
        // response.errors = null;
        // response.data = null;
        // res.json(response);
    }
    else {
        next(new Error('User Not Found !'));
    }
});

router.post('/setPublicKey', (req, res, next) => {
    if(!req.body.username || !req.body.platform || !req.body.publicKey) return next(new Error('bad request.'));
    usersUtils.addPublicKey(req.body.username, req.body.platform, req.body.publicKey);
    response.status = true;
    response.errors = null;
    response.data = null;
    res.json(response);
});

router.get('/getPublicKeys/:username', async (req, res, next) => {
    let username = req.params['username'];
    let result = await usersUtils.getPublicKeys(username);

    if(result.length === 0) return next(new Error('wrong username'));

    response.status = true;
    response.errors = null;
    response.data = result;
    res.json(response);
});

// Get single User profile pic
router.get('/getProfilePic/:username'  , async  (req, res, next) => {
    let ip = 'hi' ;
    let username = req.params['username'];
    usersUtils.getUserProfilePic(username).then(
        (result) => {
                Object.keys(ifaces).forEach(function (ifname) {
                    var alias = 0;

                    ifaces[ifname].forEach(function (iface) {
                        if ('IPv4' !== iface.family || iface.internal !== false) {
                            // skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
                            return;
                        }

                        if (alias >= 1) {
                            // this single interface has multiple ipv4 addresses
                            console.log(ifname + ':' + alias, iface.address);
                        } else {
                            // this interface has only one ipv4 adress
                            console.log(ifname, iface.address);
                            ip = iface.address ;
                        }
                        ++alias;
                    });
                });
                // console.log(ip+':8080/statics/profilePics/'+ result);
                // console.log(result);
                response.errors = null ;
                response.data = ip+':8080/statics/profilePics/'+ result ;
                response.status = true ;
                res.json(response);
        }
    )
        .catch(
            (err) => {
                console.log(err);
                response.errors = 'User Doesnt have a profile pic' ;
                response.data = null ;
                response.status = false ;
                res.json(response);
            }
        );
});


//Set Single User profile pic
router.post('/updateProfilePic',  (req, res, next) => {
    // Req. body : Username , img64
    if (req.body.username && req.body.img64 ) {
       usersUtils.updateUserProfilePic(req.body.username, req.body.img64).then(
           (result) => {
               response.errors = null ;
               response.data = null ;
               response.status = true ;
               res.json(response);
           }
       ).catch(
           (err) => {
               console.log(err);
               response.errors = err ;
               response.data = null ;
               response.status = false ;
               res.json(response);
           }
       )

    } else {
        next(new Error('username or image is undefined !'));
    }
});

router.get('/getFriendsPics/:username',  (req, res, next) => {
    let username = req.params['username'];
    if(username){
            usersUtils.getFriendsPics(username)
                .then(result => {
                    response.status = true ;
                    response.errors = null;
                    response.data = result ;
                    res.json(response);
                })
                .catch(err => {
                    response.status = false ;
                    response.errors = err;
                    response.data = null ;
                    res.json(response);
                })
    }else {
        response.status = false ;
        response.errors = 'Undefined Username !';
        response.data = null ;
        res.json(response );
    }
});
//Get All Users ...
router.get('/users', limiterOpts  , (req, res, next) => {
   
    fs.promises.readFile('./storage/users.json')
    .then((data) => {
        res.json(JSON.parse(data.toString()));
    })
    .catch((err) => {
        console.log(err);
    });
});

module.exports = router;

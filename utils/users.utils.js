const fs = require('fs');
const os = require('os');
const ifaces = os.networkInterfaces();
const bcrypt = require('bcryptjs');

const profilePicsDir = './statics/profilePics' ;

let fetchUsers = () => {
    try{
       let users = fs.readFileSync('./storage/users.json');
       return JSON.parse(users);
    }catch(e){
        //console.log(e);
        return [];
    }
};

/**
 *
 * @param {String} username
 *
 * @return {User} || -1
 */
let searchForUser = function(username) {
    let userList = fetchUsers();
    // TODO : Change to for of: completed
    for(let val of userList){
        if(val.username === username) return val;
    }
};

let getUserObject = (body) => {
    let user = {
        username: body.username,
        password: body.password,
        email: body.email,
        name: body.name === undefined ? body.username : body.name,
        friends: [],
        blockedUsers: [],
        platforms:[],
        signupData: getDate(),
        // Need Handling
        verified : false ,
        generatedCode: null,
        // delete or not ???? 
        status: body.status === undefined ? '' : body.status,
        private: body.private === undefined ? false : body.private,
    };

    // bcrypt
    let salt = bcrypt.genSaltSync(10);
    let hash = bcrypt.hashSync(body.password, salt);
    user.password = hash ;
    if(user.platforms.indexOf(body.platform) === -1) user.platforms.push(body.platform);
    return user;
    
};

let isBlockUser = (blockedUsers, username) => {
    for(let name of blockedUsers)
        if(name === username) return true;
    return false;
};

let writeUsers = (users) => {
    fs.writeFile('./storage/users.json', JSON.stringify(users), (err) => {
        if(err){
            console.log('ERROR: write', err.message);
        }
    });
};

let addUser = (user) => {
    users = fetchUsers();

    let result = checkDuplication(users, user);
    if(result !== null){
        return { err: result };
    }
    else{
        users.push(user);
        writeUsers(users);
        addToLastSeen(user.username);
        return { err: result };
    } 
};

let addToLastSeen = (username) => {

    fs.promises.readFile('./storage/lastSeen.json')
    .then((data) => {
        try{
            data = JSON.parse(data);
        }
        catch(e){ data = {}; }
        data[username] = getDate();
        fs.promises.writeFile('./storage/lastSeen.json', JSON.stringify(data));
    })
    .catch((err) => {
        let data = {};
        data[username] = 1;
        fs.promises.writeFile('./storage/lastSeen.json', JSON.stringify(data));
    });
};

let checkDuplication = (users, user) => {

    for(let _user of users){
        if(_user.username === user.username) return 'username already exist';
        if(_user.email === user.email) return 'email already exist';
    }

    return null;
};

let login = (username, password) => {
    let users = fetchUsers();
    for(let user of users){
        console.log(user.password);
        if(user.username === username && bcrypt.compare(password, user.password)) return true
    }
    return false;
};

let getUserLastSeen = (username) => {
    return fs.promises.readFile('./storage/lastSeen.json')
    .then((data) => {
        data = JSON.parse(data);
        if(data[username]) return data[username];
        return null;
    })
    .catch((err) => {
        console.error(err);
    });
};

let updateUserLastSeen = (username, date) => {
    // TODO:
    fs.promises.readFile('./storage/lastSeen.json')
    .then((data) => {
        data = JSON.parse(data);
        data[username] = date;
        fs.promises.writeFile('./storage/lastSeen.json', JSON.stringify(data));
    })
    .catch((err) => {
        console.log(err);
    });
};

/**
 *
 * @param currentUser
 * @param newFriend
 *
 * @return {boolean}
 */
let addFriend =function(currentUser, newFriend){
    let usersList = fetchUsers();
    let a1 = false, a2 = false;
    for(let u of usersList){
        if(u.username == currentUser){
        	if(u.friends.indexOf(newFriend)!==-1) return {status:false, error:"this friend already exist."};
            u.friends.push(newFriend);
            a1 = true;
        }
        if(u.username == newFriend){
            u.friends.push(currentUser);
            a2 = true;
        }
    }
    if(a1 && a2){
        writeUsers(usersList);
        return {status:true, error:null};;
    }
    return {status:false, error:'wrong username or friend name'};
};

let getDate = () => {
    
    let d = new Date();
    return d.getFullYear() + '-' + (d.getMonth()+1) + '-' + d.getDate() + ':' + d.getHours() + '.' + d.getMinutes();; 
};

let getAllBlockedUsers = () => {
    let usersList = fetchUsers();
    let AllblockedUsers = {};

    for(let user of usersList){
        AllblockedUsers[user.username] = user.blockedUsers
    }
    return AllblockedUsers;
};

let blockUser = function (currentUser, blocked) {
    let usersList = fetchUsers();
    for (let user of usersList) {
      if (user.username == currentUser) {
        user.blockedUsers.push(blocked);
        writeUsers(usersList);
        return true ;
      }
    }
    return false ;
};

/***
 *
 * @param currentUser
 * @param blocked
 * @return {boolean}
 */

let unBlockUser = function(currentUser, blocked){
    let usersList = fetchUsers();
    for (let user of usersList) {
      if (user.username == currentUser) {
      let index = user.blockedUsers.indexOf(blocked);
      if (index != -1){
        user.blockedUsers.splice(index,1);
        console.log(user);
        writeUsers(usersList);
        return true ;
        }
      }
    }
    return false ;
};

/***
 *
 * @param currentUser
 * @param deleted
 * @return {boolean}
 */
  
let deleteUser = function(currentUser, deleted){
    let usersList = fetchUsers();
    let d1 , d2 = false ;
    for (let user of usersList) {
        if (d1 && d2 ){
            writeUsers(usersList);
            return true ;
        }
      if (user.username == currentUser) {
      let index = user.friends.indexOf(deleted);
      if (index != -1){
        user.friends.splice(index,1);
        console.log(user);
        console.log(usersList);
        d1 = true ;
        }
      }
      else if (user.username == deleted) {
      let index = user.friends.indexOf(currentUser);
      if (index != -1){
        user.friends.splice(index,1);
        console.log(user);
        d2 = true ;
        }
      }
    }
    console.log(usersList);
    return false;
};

/***
 *
 * @return {Array}
 */

let getAllUsernames = () => {
    let usernames = [];
    let userList = fetchUsers();
    for(let u of userList) usernames.push(u.username);
    return usernames;
};


/***
 *
 * @param str
 * @return {Array}
 */

// str coude be any string
let searchForSimilirUsers = (str) => {
    let usersList = fetchUsers();
    let result = [];
    for(let user of usersList){
        if(user.username.includes(str) || user.name.includes(str) || user.email.includes(str))
            result.push({name: user.name, username: user.username,  email: user.email });
    }
    return result;
};

/***
 *
 * @param username
 * @param platform
 * @param key
 */

let addPublicKey = (username, platform, key) => {
    let path = `./storage/keys/${username}.${platform}.key`;
    fs.writeFile(path, key, (err) => {
        if(err) console.log(err);
    });
};

let getPublicKeys = async (username) => {
    // TODO
    let result = [];
    let wPath = `./storage/keys/${username}.windows.key`;
    let aPath = `./storage/keys/${username}.android.key`;

    let wExist = fs.existsSync(wPath);
    let aExist = fs.existsSync(aPath);

    if(wExist){
        let k = await fs.promises.readFile(wPath);
        result.push({ publicKey:k.toString(), platform: 'windows' });
    }
    if(aExist){
        let k = await fs.promises.readFile(aPath);
        result.push({ publicKey:k.toString(), platform: 'android' });
    }

    return result;
};

let addPlatform = (username, platform) =>{
    let usersList = fetchUsers();
    for(let user of usersList){
        if(user.username === username){
            if(user.platforms.indexOf(platform) == -1){
                user.platforms.push(platform);
                writeUsers(usersList);
            }
            else{
                return;
            }
        }
    }

};

let getAllUsersPlatforms = ()=>{
    let res = {};
    let usersList = fetchUsers();
    for(let user of usersList){
        res[user.username] = user.platforms;
    }
    return res;
};
let fetchProfilePicsFile = () => {
  try {
      let picsFile = fs.readFileSync('./storage/profile/pics.json');
      console.log(picsFile);
      let picsArr = JSON.parse(picsFile);
      return picsArr ;
  }  catch (e) {
      console.log(e);
      return null;
  }
};

let addUserPic = (pic64,username) => {

    let buff = Buffer.from(pic64, 'base64');
    fs.writeFileSync('./statics/profilePics/' + username+'.png', buff);

        // let picsArr = fetchProfilePicsFile() ;
        // if (picsArr) {
        //     picsArr.push({
        //         user : username,
        //         pic : pic64
        //     });
        //     writePicsArr(picsArr);
        //     return true;
        // } else {
        //     return false ;
        // }
};

let updateUserProfilePic = (username, pic) => {
    return new Promise((resolve, reject) => {
        let users = fetchUsers();
        for (let u of users) {
            if (u.username == username) {
                let buff = Buffer.from(pic, 'base64');
                fs.writeFileSync('./statics/profilePics/'+ username+'.png', buff);
                console.log('Base64 image data converted to file:' + username +'.png');
                resolve (true);
            }
        }
        reject('User not found');
    })

    // uSer not found >>>


    // let picsArr = fetchProfilePicsFile() ;
    // if (picsArr) {
    //     for (let p of picsArr) {
    //         if (p.user == username) {
    //             p.pic = pic ;
    //             writePicsArr(picsArr);
    //             return true ;
    //         }
    //     }
    //     return false ;
    // }
};

let getUserProfilePic =  (username) => {
    return new Promise((resolve, reject) => {
        fs.readdir(profilePicsDir, (err, files) => {
            if (err) {console.log(err); return}
            for (let file of files) {
                let dotIndex = file.indexOf('.');
                let fileName = file.substring(0, dotIndex);
                // console.log(fileName);
                if (fileName == username) {
                    // console.log(file);
                    resolve(file);
                }

            }
            reject(false);
        })
    })



    // let picsArr = fetchProfilePicsFile() ;
    // if (picsArr) {
    //     for (let p of picsArr) {
    //         if (p.user == username) {
    //             return p.pic
    //         }
    //     }
    //       return false ;
    //     }
};


let getFriendsPics =  (username) => {
    return new Promise(async (resolve, reject) => {
        let pics = { };
        let currFriends;
        let resF = searchForUser(username);
        if (resF) {
            currFriends = resF.friends;
            for (let cf of currFriends) {
                let ip ;
                await getUserProfilePic(cf)
                    .then(
                        (pic) => {
                            Object.keys(ifaces).forEach(function (ifname) {
                                var alias = 0;

                                ifaces[ifname].forEach(function (iface) {
                                    if ('IPv4' !== iface.family || iface.internal !== false) {
                                        return;
                                    }
                                    if (alias >= 1) {
                                        // this single interface has multiple ipv4s
                                    } else {
                                        console.log(ifname, iface.address);
                                        ip = iface.address ;
                                    }
                                    ++alias;
                                });
                            });
                            let url = ip+':8080/statics/profilePics/'+ pic ;
                            pics[cf] = url ;
                        }
                    )
                    .catch(
                        err => {console.log(err)}
                    )

            }
            console.log(pics);
            resolve (pics);
        }
        reject('User not Found !');
    })
};


let writePicsArr = (pics) => {
    fs.writeFile('./storage/profile/pics.json', JSON.stringify(pics), (err) => {
        if(err){
            console.log('ERROR: write', err.message);
        }
    });
};

module.exports = {
    addUser,
    login,
    addFriend,
    searchForUser,
    getUserObject,
    searchForSimilirUsers,
    getUserLastSeen,
    updateUserLastSeen,
    isBlockUser,
    getAllBlockedUsers,
    getDate,
    blockUser,
    unBlockUser,
    getAllUsernames,
    addPublicKey,
    getPublicKeys,
    deleteUser,
    addPlatform,
    getAllUsersPlatforms,
    deleteUser,
    addUserPic,
    getUserProfilePic,
    updateUserProfilePic,
    getFriendsPics,
    updateUserProfilePic
};


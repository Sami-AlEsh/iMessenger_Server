const fs = require('fs');

let fetchUsers = () => {
    try{
       let users = fs.readFileSync('./storage/users.json');
       return JSON.parse(users);
    }catch(e){
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
    let res = null ;
    // TODO : Change to for of
    var BreakException = {};
    try {
        userList.forEach(val => {
            console.log(val);
            if (val.username == username) {
                console.log('=======')
                console.log(val);
                res = val;

                throw BreakException;
            }
        })
    } catch (e) {
        // Do nothing
        return res;
    }
}

let writeUsers = (users) => {
    fs.writeFile('./storage/users.json', JSON.stringify(users), (err) => {
        if(err){
            console.log('ERROR: write', err.message);
        }
    });
};

let addUser = (user) => {
    users = fetchUsers();

    if(checkDuplication(users, user)){
        return {
            err: 'user info have duplication'
        };
    }
    else{
        users.push(user);
        writeUsers(users);
        return {
            err: null
        };
    } 
};

let checkDuplication = (users, user) => {
    duplication = 0;
    users.forEach(_user => {
        if(_user.email === user.email || _user.username === user.username) duplication++;
   });

   if(duplication === 0){
       return false;
   }
   else {
       return true;
   }
};

let login = (username, password) => {
    let users = fetchUsers();

    let exist = false;
    users.forEach((user) => {
        if(user.username === username && user.password === password){
            exist = true;
        }
    });

    return exist;
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
    var BreakException = {};
    try{
        usersList.forEach(u => {
            if(u.username == currentUser){
                u.friends.push(newFriend);
                writeUsers(usersList);
            }
           throw BreakException
        });
    }catch (e) {

        return true
    }
   return false;
};

module.exports = {
   addUser,
   login,
    addFriend,
    searchForUser
}

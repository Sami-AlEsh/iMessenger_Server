const fs = require('fs');

let fetchUsers = () => {
    try{
       let users = fs.readFileSync('./storage/users.json');
       return JSON.parse(users);
    }catch(e){
        return [];
    }
};

let searchForUser = function(username) {
    let userList = fetchUsers();
    userList.forEach(val => {
        if(val.username === username) {
            return val ;
        }
    })
    return -1 ;
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

let addFriend =function(currentUser, newFriend){
    let usersList = fetchUsers();
    usersList.forEach(u => {
        if(u.username === currentUser){
            u.friends.push(newFriend);
        }
        return true;
    });
};

module.exports = {
   addUser,
   login,
    addFriend,
    searchForUser
}

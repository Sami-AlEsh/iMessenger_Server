const ChatServer = require('./tcp-server-class');

let chatServer = new ChatServer(3001, '0.0.0.0');

chatServer.runServer();



//HTTP PORT
const express = require('express')
const app = express();
const path = require('path');
const bodyParser = require('body-parser');
const response = require('./shared/responseForm');
const PORT = 8080;

app.use(express.static(path.join(__dirname,'statics')));


// Get user Profile Pic
app.use(express.static(path.join(__dirname,'statics/profilePics')));
app.get('/statics/profilePics/:name' ,(req , res)=>{
	let name = req.params['name'];
	res.sendFile(path.join(__dirname,'statics/profilePics/'+name));
});
////////////////////

const userRoute = require('./routers/users.router');
const indexRoute = require('./routers/indexRouter');


app.use(bodyParser.json({limit: '5mb'}));


app.use('/index',indexRoute);
app.use('/user',userRoute);

let errHandler = (err, req, res, next) => {
	response.status = false;
	response.errors = err.message;
	response.data = null;

	res.json(response);
};

app.use(errHandler);

app.listen(PORT, () => console.log(`Express HTTP Server listening on port ${PORT}!`));

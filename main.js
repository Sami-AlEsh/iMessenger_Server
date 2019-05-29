//TCP PORT
const ChatServer = require('./tcp-server-class');
let chatServer = new ChatServer(3001, '0.0.0.0');
chatServer.runServer();


//HTTP PORT
const express = require('express')
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const PORT = 8080;
const rateLimit = require("express-rate-limit");



const userRoute = require('./routers/users.router');
const indexRoute = require('./routers/indexRouter');


app.use(cors());
app.use(bodyParser.json());


app.use('/index',indexRoute);
app.use('/user',userRoute);

app.listen(PORT, () => console.log(`Express HTTP Server listening on port ${PORT}!`));


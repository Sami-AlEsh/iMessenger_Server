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

app.use(cors());
app.use(bodyParser.json());

const indexRoute = require('./routers/indexRouter');
const userRoute = require('./routers/users.router');

app.listen(PORT, () => console.log(`Express HTTP Server listening on port ${PORT}!`));
app.use('/index',indexRoute);
app.use('/users',userRoute);

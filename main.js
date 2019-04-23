const ChatServer = require('./tcp-server-class');

const express = require('express')
const app = express();
const PORT = 3000;

const userRoute = require('./routers/users.router');
const indexRoute = require('./routers/indexRouter');

let chatServer = new ChatServer(3001, '0.0.0.0');

chatServer.runServer();

app.use('/index',indexRoute);
app.use('/user',userRoute);

app.listen(PORT, () => console.log(`Express HTTP Server listening on port ${PORT}!`));


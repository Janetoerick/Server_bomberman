//const express = require("express");
//const http = require("http");
//const socket = require("ws");
//const app = express();
//const server = http.createServer(app);
//const sockets = socket(server);
//app.get('/', (req, res) => res.send("helo"));
//const port = 3000;
//server.listen(port, () => console.log(`Server rodando na porta ${port}`));

const app = require('./app');
const appWs = require('./app-ws');
const appChat = require('./chat');

const server = app.listen(process.env.PORT || 3000, () => {
    console.log(`App Express is running!`);
})
 
appWs(server);
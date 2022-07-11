const express = require("express");
const http = require("http");
const socket = require("socket.io");

const app = express();
const server = http.createServer(app);
const sockets = socket(server);

sockets.on('connection', (socket) => {
    console.log(`${socket.id} conectado.`);
    
});



//app.get('/', (req, res) => res.send("helo"));

const port = 4000;
server.listen(port, () => console.log(`Server rodando na porta ${port}`));
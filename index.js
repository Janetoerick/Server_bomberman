const express = require("express");
const http = require("http");
const socket = require("socket.io");

const app = express();
const server = http.createServer(app);
const sockets = socket(server);


let clients = []

let lobby = {
    games: [],
    chat: []
}

let message_chat = {
    user_name: "",
    message: ""
}

let game = {
    id: -1,
    players: [],            // jogadores
    winner: -1,             // vencedor
    started: false          // se o jogo começou
};

let player = {
    id: "",
    name: "",
    position_x: 0,          // posicao x no mapa
    position_y: 0,          // posicao y no mapa
    bomb_accessible: 1,     // quantidade total de bomba possivel que pode colocar no mapa
    bomb_available: 1,      // quantidade de bomba disponivel para colocar no mapa
    bomb_size: 2,           // numero de casas que a bomba se propaga
    death: false            // se esta morto
};



sockets.on('connection', (socket) => {
    console.log(`${socket.id} conectado.`);



});



//app.get('/', (req, res) => res.send("helo"));

const port = 4000;
server.listen(port, () => console.log(`Server rodando na porta ${port}`));
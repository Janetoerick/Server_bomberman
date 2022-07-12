const WebSocket = require('ws');

let clients = []

let users = []

let user = {
    email: "",
    username: "",
    senha: ""
}

let lobby = {
    chat: [],
    games: []
}

let message_chat = {
    username: "",
    message: ""
}

let game = {
    id: -1,
    players: [],            // jogadores
    winner: -1,             // vencedor
    started: false          // se o jogo começou
};

let player = {
    username: "",
    position_x: 0,          // posicao x no mapa
    position_y: 0,          // posicao y no mapa
    bomb_accessible: 1,     // quantidade total de bomba possivel que pode colocar no mapa
    bomb_available: 1,      // quantidade de bomba disponivel para colocar no mapa
    bomb_size: 2,           // numero de casas que a bomba se propaga
    death: false            // se esta morto
};

function onMessage(ws, data) {
    const json = JSON.parse(data);
    
    if(json.type == "register"){
        var approved = true;
        for(var i = 0; i < users.length; i++){
            if(users[i].username == json.username || users[i].email == json.email){
                approved = false;
            }
        }
    
        if(approved){
            var u = JSON.parse(JSON.stringify(user));
            u.username = json.username;
            u.email = json.email;
            u.senha = json.senha;
    
            users.push(u);
            console.log("User ", u.username, " add in system!");
            ws.send(JSON.stringify({
                type: 'Registration',
                data: 'success'
            }));
        } else {
            ws.send(JSON.stringify({
                type: 'Registration',
                data: 'error'
            }));
        } 
    } else if (json.type == "login") {
        for(var i = 0; i < users.length; i++){
            if(users[i].username == json.username){
                if(users[i].password == json.password){
                    ws.send(JSON.stringify({
                        type: "login",
                        data: "sucess"
                    }));
                } else {
                    ws.send(JSON.stringify({
                        type: "login",
                        data: "error"
                    }));
                }
            }
        }
    }
}

function onError(ws, err) {
    console.error(`onError: ${err.message}`);
}

function onClose(ws, reasonCode, description) {
    console.log(`onClose: ${reasonCode} - ${description}`);
    const index = clients.indexOf(ws);
    if (index > -1) {
        clients.splice(index, 1);
    }
}

function onConnection(ws, req) {
    clients.push(ws);
    ws.on('message', data => onMessage(ws, data));
    ws.on('error', error => onError(ws, error));
    ws.on('close', (reasonCode, description) => onClose(ws, reasonCode, description));
    console.log(`onConnection`);
}
 
module.exports = (server) => {
    const wss = new WebSocket.Server({
        server
    });
 
    wss.on('connection', onConnection);
 
    console.log(`App Web Socket Server is running!`);
    return wss;
}
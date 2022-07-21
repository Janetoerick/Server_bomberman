const WebSocket = require('ws');

let clients = []

let users = []

let user = {
    email: "",
    username: "",
    senha: "",
    inGame: false
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
    id: "",
    owner: "",
    link_acess: "",
    players: [],            // jogadores
    winner: -1,             // vencedor
    started: false          // se o jogo começou
};

let player = {
    username: "",
    socket: "",
    position_x: 0,          // posicao x no mapa
    position_y: 0,          // posicao y no mapa
    bomb_accessible: 1,     // quantidade total de bomba possivel que pode colocar no mapa
    bomb_available: 1,      // quantidade de bomba disponivel para colocar no mapa
    bomb_size: 2,           // numero de casas que a bomba se propaga
    death: false            // se esta morto
};

let last_login;

function getGame(nameOwner){    // verifica se existe o jogo no servidor (pelo nome do criador)
    for(i = 0; i < lobby.maps.length; i++){
        if(ws == lobby.maps[i].owner){
            return lobby.maps[i];
        }
    }
    return false;
}

function getActualDate(){
    var actual_date = new Date();
   
    var day = (actual_date.getDate()<10 ? '0' : '') + actual_date.getDate();
    var month = ((actual_date.getMonth() + 1)<10 ? '0' : '') + (actual_date.getMonth() + 1);
    var year = actual_date.getFullYear();
    var hour = (actual_date.getHours()<10 ? '0' : '') + actual_date.getHours();
    var minute = (actual_date.getMinutes()<10 ? '0' : '') + actual_date.getMinutes();
    var second = (actual_date.getSeconds()<10 ? '0' : '') + actual_date.getSeconds();
   
    var formatted_date = day + "/" + month + "/" + year + " " + hour + ":" + minute + ":" + second;
   
    return formatted_date;
   }

function onMessage(ws, data) {
    const json = JSON.parse(data);
    if(json.inGame == "false"){
        if(json.type == "register"){                // --------------------------------- // JSON : { inGame: "false",
            var approved = true;                                                         //          type:"register",
            for(var i = 0; i < users.length; i++){                                       //         username: <login do usuario>,
                if(users[i].username == json.username || users[i].email == json.email){  //         email: <email do usuario>,
                    approved = false;                                                    //         senha: <senha do usuario>
                }                                                                        //        }
            }
        
            if(approved){
                var u = JSON.parse(JSON.stringify(user));
                u.username = json.username;
                u.email = json.email;
                u.senha = json.senha;
        
                users.push(u);
                console.log("# User ", u.username, " add in system");
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
        } else if (json.type == "login") {          // ------------------------ // JSON : { inGame: "false",                        
            last_login = json.username;
            for(var i = 0; i < users.length; i++){                              //          type:"login",
                if(users[i].username == json.username){                         //          username: <login do usuario>,
                    if(users[i].password == json.password){                     //          senha: <senha do usuario>
                        console.log("$ User ", json.username, " fez login")     //         }
                        ws.send(JSON.stringify({
                            type: "login",
                            data: "success"
                        }));
                    } else {
                        ws.send(JSON.stringify({
                            type: "login",
                            data: "error"
                        }));
                    }
                } else {
                    ws.send(JSON.stringify({
                        type: "login",
                        data: "error"
                    }));
                }
            }
        } else if (json.type == "setMessage"){
            console.log("usuario: "+ json.username +" - mandou no chat: "+ json.message);
            for(var i = 0; i < clients.length; i++){
                clients[i].send(JSON.stringify({
                    type: "setMessage",
                    data: json.username +" : "+ json.message
                }));
            }

        } else if (json.type == "getUser") {
            ws.send(JSON.stringify({
                type: "setUser",
                data: last_login
            }));
        }else if (json.type == "createGame") {     // ------------------------ // JSON : { inGame: "false",
            if(getGame(json.name) == false){                                    //          type : "createGame",
                ws.send(JSON.stringify({                                        //          name : <nome do jogador> 
                    type: "createGame",                                         //        } 
                    data: "error"
                }));
            } else {
                let newgame = game;             // 
                newgame.id = json.name;         // criando novo jogo
                newgame.owner = ws;             //
                newgame.link_acess = json.name; //
    
                let newplayer = player;         //
                newplayer.username = json.name; // criando novo jogador
                newplayer.socket = ws;          //
    
                newgame.players.push(newplayer);// colocando jogador no jogo
    
                lobby.games.push(newgame);      // salvando jogo no servidor
    
                console.log("Jogador ", json.name, " criou um novo jogo."); // notificando no servidor
    
                ws.send(JSON.stringify({
                    type: "createGame",
                    data: "success"
                }));
            }
        }
    } else {
        if(json.type == "introGame"){ // entrar na sala do jogo                             // JSON : { inGame: "false",
            let tempGame = getGame(json.nameId);                                            //          type: "introGame",          
            if(tempGame == false){                                                          //          nameId: <username do dono do jogo>,
                ws.send(JSON.stringify({                                                    //          name: <username do jogador>
                    type: "introGame",                                                      //         }
                    data: "Erro - Jogo não existe!"
                }));
            } else {
                let newPlayer = player;
                newPlayer.username = json.name;
                newPlayer.socket = ws;
    
                if(tempGame.players.length == 1){
                    newPlayer.position_x = 10;
                    newPlayer.position_y = 0;
                } else if(tempGame.players.length == 2){
                    newPlayer.position_x = 10;
                    newPlayer.position_y = 10;
                } else if(tempGame.players.length == 3){
                    newPlayer.position_x = 0;
                    newPlayer.position_y = 10;
                } else {
                    ws.send(JSON.stringify({
                        type: "introGame",
                        data: "Erro - Jogo já atingiu o número máximo de jogadores"
                    }));
                }
                
                var compare = false;
                for(i = 0; i < lobby.maps.length; i++){
                    if(lobby.maps.id == json.nameId){
                        lobby.maps.players.push(newPlayer);
                        console.log("Jogador ",newplayer.username, " entrou no jogo de ", json.nameId);
                        ws.send(JSON.stringify({
                            type: "introGame",
                            data: "success"
                        }));
                        compare = true;
                        break;
                    }
                }
                if(!compare){
                    ws.send(JSON.stringify({
                        type: "introGame",
                        data: "ERROR 119"
                    }));
                }
            }

            

        } else if (json.type == "startGame") { // começar a partida

        } else if (json.type == "move") { // mover personagem

        } else if (json.type == "bombCreate") { // colocar bomba no mapa

        } else if (json.type == "bombDestroyer") { // danos causado pela bomba (qual bomba explodiu e quais blocos quebrou)

        } else if (json.type == "deathPlayer"){ // jogador morreu [se esta sobrando um, manda mensagem que ele ganhou]

        } else if (json.type == "getPower") { // pegar poder

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
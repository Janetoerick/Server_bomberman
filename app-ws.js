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
    players: [],            // jogadores
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

// criando usuarios e game para teste no unity ####
let p1 = player;
p1.username = "janeto";
let p2 = player;
p2.username = "clauber";
let g = game;
g.id = "clauber";
g.players.push(p1);
g.players.push(p2);
lobby.games.push(g);
// ################################################

function getGame(id){    // verifica se existe o jogo no servidor se existir retorna true, se nao, retorna false
    if(lobby.games.length > 0){
        let i = 0;
        while(i < lobby.games.length){
            console.log("-->  ", lobby.games[i].id);
            if(id === lobby.games[i].id){
                return true;
            }
            i++;
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
            var verify = false;
            last_login = json.username;
            for(var i = 0; i < users.length; i++){                              //          type:"login",
                if(users[i].username == json.username){                         //          username: <login do usuario>,
                    if(users[i].password == json.password){                     //          senha: <senha do usuario>
                        console.log("$ User ", json.username, " fez login")     //         }
                        ws.send(JSON.stringify({
                            type: "login",
                            data: "success"
                        }));
                        verify = true;
                    }
                    break;
                }
            }
            if(!verify){
                ws.send(JSON.stringify({
                    type: "login",
                    data: "error"
                }));
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
            if(lobby.games.length > 0){
                for(var i = 0; i < lobby.games.length; i++){
                    ws.send(JSON.stringify({
                        type: "loadGames",
                        data: "success",
                        userCreate: lobby.games[i].id,
                        size_players: lobby.games[i].players.length
                    }));
                }
            }
            
        }else if (json.type == "createGame") {     // ------------------------ // JSON : { inGame: "false",
            if(getGame(json.name) == true){                                    //          type : "createGame",
                ws.send(JSON.stringify({                                       //          name : <nome do jogador> 
                    type: "createGame",                                        //        } 
                    data: "error"
                }));
            } else {
                var newgame = game;             // 
                newgame.id = json.name;         // criando novo jogo
                newgame.owner = ws;             //
                newPlayer.position_x = 1;
                newPlayer.position_y = 1;
    
                let newplayer = player;         //
                newplayer.username = json.name; // criando novo jogador
                newplayer.socket = ws;          //
    
                newgame.players.push(newplayer);// colocando jogador no jogo
                

                // for(i = 0; i < lobby.games.length; i++){
                //     console.log("#- lobby1: ", lobby.games[i].id);
                // }
                // console.log("----------------------------------------------------------------------------------");

                lobby.games.push(newgame);      // salvando jogo no servidor

                // for(i = 0; i < lobby.games.length; i++){
                //     console.log("#- lobby2: ", lobby.games[i].id);
                // }
                // console.log("----------------------------------------------------------------------------------");
    
                console.log("Jogador ", json.name, " criou um novo jogo. "); // notificando no servidor
                
                for(var i = 0; i < clients.length; i++){
                    clients[i].send(JSON.stringify({
                        type: "createGame",
                        data: "success",
                        userCreate: json.name,
                        size_players: 1
                    }));
                }
            }
        }
    } else {
        if(json.type == "introGame"){ // entrar na sala do jogo                             // JSON : { inGame: "true",
                                                                                            //          type: "introGame",          
            if(getGame(json.nameId) == false){                                              //          nameId: <username do dono do jogo>,
                ws.send(JSON.stringify({                                                    //          name: <username do jogador>
                    type: "introGame",                                                      //         }
                    data: "Erro - Jogo não existe!"
                }));
            } else {
                let newPlayer = player;
                newPlayer.username = json.name;
                newPlayer.socket = ws;

                let i = 0;
                let tempGame;
                let is_owner = false;       // verificador se eh dono da sala
                while(i < lobby.games.length){
                    if(json.name = lobby.games[i].id){
                        is_owner = true;
                    }
                    if(json.nameId == lobby.games[i].id){
                        tempGame = lobby.games[i];
                        break;
                    }
                    i++;
                }
                if(!lobby.games[i].started){
                    ws.send(JSON.stringify({
                        type: "introGame",
                        data: "Erro - Jogo já foi iniciado!"
                    }));
                }
                if(!is_owner){
                    if(tempGame.players.length == 1){
                        newPlayer.position_x = 8;
                        newPlayer.position_y = 1;
                    } else if(tempGame.players.length == 2){
                        newPlayer.position_x = 8;
                        newPlayer.position_y = 8;
                    } else if(tempGame.players.length == 3){
                        newPlayer.position_x = 1;
                        newPlayer.position_y = 8;
                    } else {
                        ws.send(JSON.stringify({
                            type: "introGame",
                            data: "Erro - Jogo já atingiu o número máximo de jogadores"
                        }));
                        return;
                    }
                    
                    if(i == lobby.games.length){
                        lobby.games[i].players.push(newPlayer);
                        ws.send(JSON.stringify({
                            type: "introGame",
                            data: "ERROR 119"
                        }));
                    } else {
                        ws.send(JSON.stringify({
                            type: "introGame",
                            data: "success",
                            checkpoint: tempGame.players.length
                        }));
                        for(i = 0; i < clients.length; i++){
                            clients[i].send(JSON.stringify({
                                type: "atGame",
                                id: tempGame.id,
                                size: tempGame.players.length + 1
                            }));
                        }
                    }
                } else {
                    ws.send(JSON.stringify({
                        type: "introGame",
                        data: "success",
                        checkpoint: 0
                    }));
                }
            }
        } else if (json.type == "startGame") { // começar a partida     -------------------------- // JSON { inGame: "true", type: "startGame", id: <nome dono>,  }
            for(var i = 0; i < lobby.games.length; i++){
                if(lobby.games[i].id == json.id){
                    if(lobby.games[i].players.length == 1){ // se só tiver um jogador na partida -> da erro
                        ws.send(JSON.stringify({
                            type: "introGame",
                            data: "erro"
                        }));
                        break;
                    }

                    var position_p = [-1, -1, -1, -1];
                    for(var j = 0; j < lobby.games[i].players.length; j++){ // pega quantas pessoas tem na partida e atribui o checkpoint
                        position_p[j] = j;
                    }
                    for(var j = 0; j < lobby.games[i].players.length; j++){ // manda a mensagem para todos que o jogo começou
                        lobby.games[i].players[j].socket.send(JSON.stringify({
                            type: "StartGame",
                            data: "start",
                            player1: position_p[j],
                            player2: position_p[j],
                            player3: position_p[j],
                            player4: position_p[j]
                        }));
                    }
                    lobby.games[i].started = true;
                    break;
                }
            }

        } else if (json.type == "bombCreate") { // colocar bomba no mapa        ----------- // Json { inGame: "true", type: "bombCreate", id = <nome dono>, position_x: <>, position_y <>}
            for(var i = 0; i < lobby.games.length; i++){
                if(json.id == lobby.games[i].id){
                    for(var j = 0; j < lobby.games[i].players.length; j++){
                        lobby.games[i].players[j].socket.send(JSON.stringify({
                            type: "bombCreate",
                            data: "newbomb",
                            position_x: json.position_x,
                            position_y: json.position_y
                        }));
                    }
                }
                break;
            }

        } else if (json.type == "deathPlayer"){ // jogador morreu [se esta sobrando um, manda mensagem que ele ganhou]
            for(var i = 0; i < lobby.games.length; i++){                // -------- JSON { inGame: "true", type: "deathPlayer", id: <nome dono>, name: <nome jogador morto>}
                if(json.id == lobby.games[i]){
                    var count_players = 0;
                    for(var j = 0; j < lobby.games[i].players.length; j++){
                        if(lobby.games[i].players[j].username == json.name){
                            lobby.games[i].players[j].death = true;
                        }
                        if(!lobby.games[i].players[j].death){
                            count_players++;
                        }
                    }
                    for(var j = 0; j < lobby.games[i].players.length; j++){
                        if(!lobby.games[i].players[j].death){
                            if(count_players == 1){
                                lobby.games[i].players[j].socket.send(JSON.stringify({
                                    type: "winner",
                                    data: true
                                }));
                            } else {
                                lobby.games[i].players[j].socket.send(JSON.stringify({
                                    type: "deathPlayer",
                                    data: json.name
                                }));
                            }
                        }
                    }
                    break;
                }
            }
        } else if (json.type == "getPower") { // pegar poder   ---- JSON { inGame: "true", type: "getPower", id: <nome dono>, idPower: <id do poder pego>}
            for(var i = 0; i < lobby.games.length; i++){
                if(lobby.games[i].id == json.id){
                    for(var j = 0; j < lobby.games[i].players.length; j++){
                        lobby.games[i].players[j].socket.send(JSON.stringify({
                            type: "getPower",
                            data: json.idPower
                        }));
                    }
                    break;
                }
            }
        } else if (json.type == "move") { // mover personagem
        
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
require("dotenv").config();

const express = require("express");
const app = express();
const server = require("http").createServer(app);
const io = require("socket.io")(server);

app.use(express.static('public'));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

//herhangi biri bağlandığında bu kod parçası çalışacak :
io.on('connection', (socket) => {
    console.log('kullanıcı bağlandı.');

    //istemcideki send message adlı olayı dinleyelim. böyle bir olayın istemcide tanımlı olması gerekiyor.
    //message adlı parametre, send message adlı olay tetiklenirse istemci tarafından yollanacak.
    socket.on('sendMessage', (message) => {
        //send message olayı gerçekleşirse istemcideki receive message olayını io.emit() ile tetikle.
        //olayı io.emit() ile tetiklemek mesajın bütün bağlı istemcilere gitmesini sağlar.
        //aynı şekilde receive message olayının da istemci tarafında tanımlı olması gerekir bu arada.
        io.emit('receiveMessage', message);
    });

    //herhangi birinin bağlantısı koptuğunda bu kod parçası çalışacak :
    socket.on('disconnect', () => {
        console.log("kullanıcı disconnect oldu.");
    });
})

server.listen(process.env.PORT);






/*

socket.emit('message', "this is a test"); //sending to sender-client only

socket.broadcast.emit('message', "this is a test"); //sending to all clients except sender

socket.broadcast.to('game').emit('message', 'nice game'); //sending to all clients in 'game' room(channel) except sender

socket.to('game').emit('message', 'enjoy the game'); //sending to sender client, only if they are in 'game' room(channel)

socket.broadcast.to(socketid).emit('message', 'for your eyes only'); //sending to individual socketid

io.emit('message', "this is a test"); //sending to all clients, include sender

io.in('game').emit('message', 'cool game'); //sending to all clients in 'game' room(channel), include sender

io.of('myNamespace').emit('message', 'gg'); //sending to all clients in namespace 'myNamespace', include sender

socket.emit(); //send to all connected clients

socket.broadcast.emit(); //send to all connected clients except the one that sent the message

socket.on(); //event listener, can be called on client to execute on server

io.sockets.socket(); //for emiting to specific clients

io.sockets.emit(); //send to all connected clients (same as socket.emit)

io.sockets.on() ; //initial connection from a client.

*/
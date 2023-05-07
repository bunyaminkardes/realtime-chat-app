require("dotenv").config();

const express = require("express");
const app = express();
const server = require("http").createServer(app);
const io = require("socket.io")(server);
const router = require("./routes.js");

const bodyParser = require('body-parser');
const session = require("express-session"); // ############### SESSION ###############

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended : true}));
app.use(session({ // ############### SESSION ###############
    secret: 'mysecret',
    resave: false,
    saveUninitialized: false
}));
app.use('/', router);


let katilimcilar = [];
let messages = []; 

//herhangi biri bağlandığında bu kod parçası çalışacak :
io.on('connection', (socket) => {

    console.log('kullanıcı bağlandı.' + socket.id);

    //clientten yeni katılımcı bağlandı olayını dinle.
    socket.on('sendYeniKatilimciBaglandi', (username) => {
        // yeni katılımcı geldiğinde diziye push et.
        const katilimci = { name: username };

        katilimcilar.push(katilimci);
        //yeni listeyi tüm clientlara yolla.
        io.emit('katilimciListele', (katilimcilar));
    });

    //herhangi biri bağlandığında son mesajları görmesi için istemciye 
    socket.emit('initializeMessages', messages);

    //istemcideki send message adlı olayı dinleyelim. böyle bir olayın istemcide tanımlı olması gerekiyor.
    //message adlı parametre, send message adlı olay tetiklenirse istemci tarafından yollanacak.
    socket.on('sendMessage', (messageData) => {
        //send message olayı gerçekleşirse istemcideki receive message olayını io.emit() ile tetikle.
        //olayı io.emit() ile tetiklemek mesajın bütün bağlı istemcilere gitmesini sağlar.
        //aynı şekilde receive message olayının da istemci tarafında tanımlı olması gerekir bu arada.
        messages.push(messageData);
        if(messages.length > 500) { //mesaj sayısı 500'ü geçerse ilk mesajı kaldırarak mesaj dizisini sınırlı tut.
            messages.shift();
        }
        io.emit('receiveMessage', messageData);
        console.log(messages);
    });

    //herhangi birinin bağlantısı koptuğunda bu kod parçası çalışacak :
    socket.on('disconnect', () => {
        console.log("kullanıcı disconnect oldu.");
    });
})

server.listen(3000);






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
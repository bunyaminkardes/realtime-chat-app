require("dotenv").config();

const express = require("express");
const app = express();
const server = require("http").createServer(app);
const io = require("socket.io")(server);
const router = require("./routes.js");
const data = require("./data.js");

const bodyParser = require('body-parser');
const session = require("express-session"); // ############### SESSION ###############

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({ // ############### SESSION ###############
    secret: 'mysecret',
    resave: false,
    saveUninitialized: false
}));
app.use('/', router);

//herhangi biri bağlandığında bu kod parçası çalışacak :
io.on('connection', (socket) => {

    console.log(socket.id + 'id numarasına sahip bir kullanıcı bağlandı.');

    //clientten yeni katılımcı bağlandı olayını dinle.
    socket.on('sendYeniKatilimciBaglandi', (username) => {
        const katilimci = { id: socket.id, name: username };
        /*
            sayfa her yenilendiğinde aynı kullanıcı adı tekrar server'a yollanacak.
            bunu engellemek için, yollanan kullanıcı adı katılımcılar listesinde var mı şeklinde
            bir kontrol yapmak gerekir. eğer yoksa katılımcıyı listeye ekleyip tüm client'lara yollayalım.
        */
        const isExist = data.katilimcilar.some((katilimci) => katilimci.name === username);
        if (!isExist) {
            data.katilimcilar.push(katilimci);
        }
        //yeni listeyi tüm clientlara yolla.
        io.emit('katilimciListele', (data.katilimcilar));
    });

    //herhangi biri bağlandığında son mesajları görmesi için ilgili istemcideki olayı tetikle.
    socket.emit('initializeMessages', data.messages);

    //istemcideki send message adlı olayı dinleyelim. böyle bir olayın istemcide tanımlı olması gerekiyor.
    //message adlı parametre, send message adlı olay tetiklenirse istemci tarafından yollanacak.
    socket.on('sendMessage', (messageData) => {
        //send message olayı gerçekleşirse istemcideki receive message olayını io.emit() ile tetikle.
        //olayı io.emit() ile tetiklemek mesajın bütün bağlı istemcilere gitmesini sağlar.
        //aynı şekilde receive message olayının da istemci tarafında tanımlı olması gerekir bu arada.
        data.messages.push(messageData);
        if (data.messages.length > 500) { //mesaj sayısı 500'ü geçerse ilk mesajı kaldırarak mesaj dizisini sınırlı tut.
            data.messages.shift();
        }
        io.emit('receiveMessage', messageData);
        console.log(data.messages);
    });

    //herhangi birinin bağlantısı koptuğunda bu kod parçası çalışacak :
    socket.on('disconnect', () => {
        console.log(socket.id + "id numarasına sahip bir kullanıcı disconnect oldu.");
        /*
            eğer bir kullanıcı çıkış yaparsa veya disconnect olursa, aynı şey olacak.
            artık bağlantıda olmayacaklar. bu durumda katılımcı dizisinde onların id
            numarasına sahip olan kısmı bulup listeden kaldıralım ve yeni listeyi
            bağlantıdaki diğer tüm clientlera tekrar atalım.
        */
        const disconnectedUser = data.katilimcilar.find((katilimci) => katilimci.id === socket.id);
        if (disconnectedUser) {
            data.katilimcilar = data.katilimcilar.filter((katilimci) => katilimci.id !== socket.id);
            io.emit('katilimciListele', data.katilimcilar);
        }
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
require("dotenv").config();

const express = require("express");
const app = express();
const server = require("http").createServer(app);
const io = require("socket.io")(server);
const router = require("./routes.js");
const data = require("./data.js");

const bodyParser = require('body-parser');
const session = require("express-session");

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
    secret: 'mysecret',
    resave: false,
    saveUninitialized: false
}));
app.use('/', router);

//herhangi biri bağlandığında bu kod parçası çalışacak :
io.on('connection', (socket) => {

    socket.on('odayaKatil', (room) => {
        socket.join(room);
    });

    //clientten yeni katılımcı bağlandı olayını dinle.
    socket.on('yeniKatilimciBaglandi', (_katilimci) => {
        let katilimci = { id: socket.id, kullaniciAdi: _katilimci.kullaniciAdi, oda: _katilimci.oda };
        /*
            sayfa her yenilendiğinde aynı kullanıcı adı tekrar server'a yollanacak.
            bunu engellemek için, yollanan kullanıcı adı katılımcılar listesinde var mı şeklinde
            bir kontrol yapmak gerekir. eğer yoksa katılımcıyı listeye ekleyip tüm client'lara yollayalım.
        */
       const isExist = data.katilimcilar.some((katilimci) => katilimci.kullaniciAdi === _katilimci.kullaniciAdi);
        if (!isExist) {
            data.katilimcilar.push(katilimci);
            /*
                yapmamız gereken ek bir kontrol var. odaya yeni biri bağlandığında yeni listeyi tüm kullanıcılara
                atacağız ancak sadece bulunulan odadaki kullanıcıların listesi atılmalı. aksi taktirde tüm odalardaki
                kullanıcıların listesi atılacak. bu yüzden filtre yapalım :
            */
            const katilimcilarOdaFiltresi = data.katilimcilar.filter((katilimci) => katilimci.oda === _katilimci.oda);
            //nihai olarak filtrelenmiş diziyi odadaki tüm kullanıcılara yayalım:
            io.to(_katilimci.oda).emit('katilimciListele', katilimcilarOdaFiltresi );
        }
        
        const mesajFiltresi = data.messages.filter((message) => message.room === _katilimci.oda);
        //herhangi biri bağlandığında son mesajları görmesi için ilgili istemcideki olayı tetikle.
        //const mesajFiltresi = data.messages.filter((message) => message.room === socket.room);
        socket.emit('mesajlariYukle', mesajFiltresi);
    });

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
        const mesajFiltresi = data.messages.filter((message) => message.room === messageData.room);
        io.to(messageData.room).emit('receiveMessage', mesajFiltresi);
    });

    //herhangi birinin bağlantısı koptuğunda bu kod parçası çalışacak :
    socket.on('disconnect', () => {
        /*
            eğer bir kullanıcı çıkış yaparsa veya disconnect olursa, aynı şey olacak.
            artık bağlantıda olmayacaklar. bu durumda katılımcı dizisinde onların id
            numarasına sahip olan kısmı bulup listeden kaldıralım ve yeni listeyi
            bağlantıdaki diğer tüm clientlera tekrar atalım.
        */
        const disconnectedUser = data.katilimcilar.find((katilimci) => katilimci.id === socket.id);
        if (disconnectedUser) {
            data.katilimcilar = data.katilimcilar.filter((katilimci) => katilimci.id !== socket.id);
            io.to(disconnectedUser.oda).emit('katilimciListele', data.katilimcilar);
        }
    });
})

server.listen(process.env.PORT);
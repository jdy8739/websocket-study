import express from "express";
import path from 'path';
import http from 'http';
import { fileURLToPath } from 'url';
import { Server } from 'socket.io';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.set('view engine', 'pug');
app.set('views', __dirname + '/views');
app.use('/public', express.static(__dirname + '/public'));
app.get('/', (_, res) => res.render('home'));
app.get('/*', (_, res) => res.redirect('/'));

const httpServer = http.createServer(app);

const ioServer = new Server(httpServer);

ioServer.on('connection', (socket) => {
    socket.on('enter_room', (roomName, callback) => {
        socket.join(roomName);
        
        callback?.();

        socket.to(roomName).emit('welcome');
    });

    socket.on('offer', (offer, roomName) => {
        socket.to(roomName).emit('offer', offer);
    });

    socket.on('answer', (answer, roomName) => {
        socket.to(roomName).emit('answer', answer);
    });

    socket.on('icecandidate', (candidate, roomName) => {
        socket.to(roomName).emit('icecandidate', candidate);
    });
});

httpServer.listen(3000, () => console.log('hey'));
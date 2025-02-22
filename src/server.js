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
    console.log('user connected');

    socket.onAny((event) => {
        console.log(`${socket.id} event: ${event}`);
    });

    socket.on('enter_room', (roomName, callback) => {
        socket.join(roomName);

        callback?.({ roomName });

        socket.to(roomName).emit('welcome', `Someone has joined in the room ${roomName}`);
    });

    socket.on('message', (message, roomName, callback) => {
        socket.to(roomName).emit('message', `${socket.id}: ${message}`);

        callback?.();
    });

    socket.on('disconnecting', () => {
        socket.rooms.forEach((room) => { // rooms means the rooms the socket is currently in.
            socket.to(room).emit('bye', `${socket.id} has left`);
        });
    });
});

httpServer.listen(3000, () => console.log('hey'));


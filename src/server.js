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

const getPublicRooms = () => {
    const { sockets: { adapter: { sids, rooms } } } = ioServer;

    const sidsKeys = Array.from(sids.keys());

    const roomsKeys = Array.from(rooms.keys());

    return roomsKeys.filter((roomKey) => !sidsKeys.includes(roomKey));
};

const updateRooms = () => {
    ioServer.sockets.emit('rooms_changed', getPublicRooms());
};

const getRoomSize = (roomName) => {
    return ioServer.sockets.adapter.rooms.get(roomName)?.size || 0;
};

ioServer.on('connection', (socket) => {
    console.log('user connected');

    updateRooms();

    socket.onAny((event) => {
        console.log(`${socket.id} event: ${event}`);
    });

    socket.on('enter_room', (roomName, callback) => {
        socket.join(roomName);

        const roomSize = getRoomSize(roomName);

        socket.to(roomName).emit(
            'welcome',
            socket.nickname || socket.id,
            roomName,
            roomSize
        );

        updateRooms();

        callback?.({ roomName, roomSize });
    });

    socket.on('nickname', (nickname, callback) => {
        socket.nickname = nickname;

        callback?.();
    });

    socket.on('message', (message, roomName, callback) => {
        socket.to(roomName).emit('message', `${socket.nickname || socket.id}: ${message}`);

        console.log(getPublicRooms())

        callback?.();
    });

    socket.on('disconnecting', () => {
        socket.rooms.forEach((roomName) => { // rooms means the rooms the socket is currently in.
            socket.to(roomName).emit(
                'bye',
                socket.nickname || socket.id,
                roomName,
                getRoomSize(roomName) - 1
                );
        });
    });

    socket.on('disconnect', updateRooms);
});

httpServer.listen(3000, () => console.log('hey'));


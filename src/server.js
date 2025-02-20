import express from "express";
import path from 'path';
import http from 'http';
import { fileURLToPath } from 'url';
import { WebSocketServer } from "ws";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.set('view engine', 'pug');
app.set('views', __dirname + '/views');
app.use('/public', express.static(__dirname + '/public'));
app.get('/', (_, res) => res.render('home'));
app.get('/*', (_, res) => res.redirect('/'));

const server = http.createServer(app);

const wss = new WebSocketServer({ server });

const sockets = [];

wss.on('connection', (ws) => {
    sockets.push(ws);

    ws.send('hello!');

    ws.on('close', () => console.log('disconnected from browser!'));

    ws.on('message', (message) => {
        sockets.forEach((ws) => ws.send(message.toString()));
    });
});

server.listen(3000, () => console.log('hey'));


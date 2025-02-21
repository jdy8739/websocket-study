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

const connectedSockets = [];

const parseMessage = (message) => JSON.parse(message.toString());

const setNickname = (ws, nickname) => (ws['nickname'] = nickname);

const getNickname = (ws) => ws['nickname'];

wss.on('connection', (ws) => {
    connectedSockets.push(ws);

    setNickname(ws, 'Anonymous');

    ws.send('Hello from socket server!');

    ws.on('close', () => console.log('disconnected from browser!'));

    ws.on('message', (_message) => {
        const { type, message } = parseMessage(_message);

        switch (type) {
            case 'nickname':
                setNickname(ws, message);
                break;
            case 'message':
                connectedSockets.forEach((cs) => cs.send(`${getNickname(ws)}: ${message}`));
                break;
        }
    });
});

server.listen(3000, () => console.log('Server listening on port 3000!'));


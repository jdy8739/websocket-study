const connectSocket = (socket) => {
    socket.addEventListener('open', () => console.log('connected with socket server!'));

    const ul = document.querySelector('ul');

    socket.addEventListener('message', ({ data }) => {
        const li = document.createElement('li');

        li.innerText = data;

        ul.appendChild(li);
    });

    socket.addEventListener('close', () => console.log('closed!'));
};

const stringify = (object) => JSON.stringify(object);

const socketSend = (socket, object) => socket.send(stringify(object));

const setMessageSubmitEvent = (socket) => {
    const form = document.querySelector('#message');

    const input = form.querySelector('input');

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        socketSend(socket, {
            type: 'message',
            message: input.value
        })

        input.value = '';
    });
};

const setNicknameSubmitEvent = (socket) => {
    const form = document.querySelector('#nickname');

    const input = form.querySelector('input');

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        socketSend(socket, {
            type: 'nickname',
            message: input.value
        })

        input.value = '';
    });
}

const run = () => {
    const socket = new WebSocket(`ws://${window.location.host}`);
    
    connectSocket(socket);

    setMessageSubmitEvent(socket);

    setNicknameSubmitEvent(socket);
};

run();




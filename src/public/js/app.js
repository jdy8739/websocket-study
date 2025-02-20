const socket = new WebSocket(`ws://${window.location.host}`);

const registerSocket = (socket) => {
    socket.addEventListener('open', () => console.log('connected!'));

    const ul = document.querySelector('ul');

    socket.addEventListener('message', ({ data }) => {
        const li = document.createElement('li');

        li.innerText = data;

        ul.appendChild(li);
    });

    socket.addEventListener('close', () => console.log('closed!'));
};

const setFormEvent = (socket) => {
    const form = document.querySelector('form');

    const input = document.querySelector('input');

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        socket.send(input.value);

        input.value = '';
    });
};

registerSocket(socket);

setFormEvent(socket);




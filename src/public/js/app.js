const socket = io();

//

const welcome = document.querySelector("#welcome");

const welcomeForm = welcome.querySelector("form");

const welcomeInput = welcomeForm.querySelector("input");

//

const room = document.querySelector("#room");

const roomTitle = room.querySelector("h3");

const ul = room.querySelector("ul");

const messageForm = room.querySelector("#msg");

const messageInput = messageForm.querySelector("input");

const nameForm = room.querySelector("#name");

const nameInput = nameForm.querySelector("input");

room.hidden = true;

//

const showRoom = ({ roomName }) => {
    welcome.hidden = true;
    room.hidden = false;
    roomTitle.innerText = `Welcome to Room ${roomName}`;

    messageForm.addEventListener("submit", (event) => {
        event.preventDefault();

        socket.emit("message", messageInput.value, roomName, () => {
            addMessage(`You: ${messageInput.value}`);

            messageInput.value = "";
        });
    });

    nameForm.addEventListener("submit", (event) => {
        event.preventDefault();

        socket.emit("nickname", nameInput.value, roomName, () => {
            addMessage(`Your nickname is ${nameInput.value}`);

            nameInput.value = "";
        });
    });
};

const addMessage = (message) => {
    const li = document.createElement("li");
    li.innerText = message;
    ul.appendChild(li);
};

welcomeForm.addEventListener("submit", (event) => {
    event.preventDefault();

    socket.emit("enter_room", welcomeInput.value, showRoom);

    welcomeInput.value = "";
});

socket.on("welcome", addMessage);

socket.on("bye", addMessage);

socket.on('message', addMessage);

socket.on('nickname', addMessage);

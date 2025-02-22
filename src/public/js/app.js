const socket = io();

//

const welcome = document.querySelector("#welcome");

const roomForm = welcome.querySelector("#room");

const roomInput = roomForm.querySelector("input");

const nameForm = welcome.querySelector("#name");

const nameInput = nameForm.querySelector("input");

//

const messages = document.querySelector("#msg");

const title = messages.querySelector("h3");

const ul = messages.querySelector("ul");

const messageForm = messages.querySelector("form");

const messageInput = messageForm.querySelector("input");

messages.hidden = true;

//

const showRoom = ({ roomName }) => {
    welcome.hidden = true;
    messages.hidden = false;
    title.innerText = `Welcome to Room ${roomName}`;

    messageForm.addEventListener("submit", (event) => {
        event.preventDefault();

        socket.emit("message", messageInput.value, roomName, () => {
            addMessage(`You: ${messageInput.value}`);

            messageInput.value = "";
        });
    });
};

const addMessage = (message) => {
    const li = document.createElement("li");
    li.innerText = message;
    ul.appendChild(li);
};

roomForm.addEventListener("submit", (event) => {
    event.preventDefault();

    socket.emit("enter_room", roomInput.value, showRoom);

    roomInput.value = "";
});

nameForm.addEventListener("submit", (event) => {
    event.preventDefault();

    socket.emit("nickname", nameInput.value, () => {
        window.alert(`Your nickname is ${nameInput.value}`);

        nameInput.value = "";
    });
});

socket.on("welcome", addMessage);

socket.on("bye", addMessage);

socket.on('message', addMessage);
const socket = io();

//

const welcome = document.querySelector("#welcome");

const welcomeForm = welcome.querySelector("form");

const welcomeInput = welcomeForm.querySelector("input");

//

const room = document.querySelector("#room");

const roomForm = room.querySelector("form");

const roomInput = roomForm.querySelector("input");

const roomTitle = room.querySelector("h3");

const ul = room.querySelector("ul");

room.hidden = true;

//

const showRoom = ({ roomName }) => {
    welcome.hidden = true;
    room.hidden = false;
    roomTitle.innerText = `Welcome to Room ${roomName}`;

    roomForm.addEventListener("submit", (event) => {
        event.preventDefault();

        socket.emit("message", roomInput.value,  roomName, () => {
            addMessage(`You: ${roomInput.value}`);

            roomInput.value = "";
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

const socket = io();

//

const welcome = document.querySelector("#welcome");

const roomForm = welcome.querySelector("#room");

const roomInput = roomForm.querySelector("input");

const nameForm = welcome.querySelector("#name");

const nameInput = nameForm.querySelector("input");

const roomList = welcome.querySelector("ul");

//

const messages = document.querySelector("#msg");

const title = messages.querySelector("h3");

const ul = messages.querySelector("ul");

const messageForm = messages.querySelector("form");

const messageInput = messageForm.querySelector("input");

messages.hidden = true;

//

const updateRoomSize = (roomName, size) => {
    title.innerText = `Welcome to Room ${roomName} (${size})`;
};

const showRoom = ({ roomName, roomSize }) => {
    welcome.hidden = true;
    messages.hidden = false;
    updateRoomSize(roomName, roomSize);

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

socket.on("welcome", (nickname, roomName, size) => {
    updateRoomSize(roomName, size);
    addMessage(`User ${nickname} has joined in this room`);
});

socket.on("bye", (nickname, roomName, size) => {
    updateRoomSize(roomName, size);
    addMessage(`User ${nickname} has left this this room`);
});

socket.on('message', addMessage);

socket.on('rooms_changed', (publicRooms) => {
    roomList.innerHTML = "";

    const roomListItems = publicRooms.map(({ roomName, size }) => {
        const li = document.createElement("li");
        li.innerText = `${roomName} (${size})`;
        return li;
    });

    roomList.append(...roomListItems);
});
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

//

/** message form listener */
let messageFormListener = null;

const resetMessages = () => {
    ul.innerHTML = "";
}

const switchElement = ({ hideEl, showEl }) => {
    hideEl.hidden = true;
    showEl.hidden = false;
}

const showRoom = (socket, roomName) => {
    switchElement({ hideEl: welcome, showEl: messages });

    const leaveButton = messages.querySelector("#leave");

    leaveButton.addEventListener("click", () => {
        socket.emit("leave_room", roomName, () => {
            switchElement({ hideEl: messages, showEl: welcome });
            
            resetMessages();

            messageForm.removeEventListener("submit", messageFormListener);
            messageFormListener = null;
        });       
    });
};

const updateRoomSize = (roomName, size) => {
    title.innerText = `Welcome to Room ${roomName} (${size})`;
};

const addMessage = (message) => {
    const li = document.createElement("li");
    li.innerText = message;
    ul.appendChild(li);
};

const setMessageEvent = (socket, roomName) => {
    messageFormListener = (event) => {
        event.preventDefault();

        socket.emit("message", messageInput.value, roomName, () => {
            addMessage(`You: ${messageInput.value}`);

            messageInput.value = "";
        });
    };
    
    messageForm.addEventListener("submit", messageFormListener);
}

const setRoomEnterEvent = (socket) => {
    roomForm.addEventListener("submit", (event) => {
        event.preventDefault();
    
        socket.emit("enter_room", roomInput.value, ({ roomName, roomSize }) => {
            showRoom(socket, roomName);

            updateRoomSize(roomName, roomSize);

            setMessageEvent(socket, roomName);
        });
    
        roomInput.value = "";
    });
};

const setNickNameChangeEvent = (socket) => {
    nameForm.addEventListener("submit", (event) => {
        event.preventDefault();
    
        socket.emit("nickname", nameInput.value, () => {
            window.alert(`Your nickname is ${nameInput.value}`);
    
            nameInput.value = "";
        });
    });
};

const setIoEvents = (socket) => {
    // fires when user joins a room
    socket.on("welcome", (nickname, roomName, size) => {
        updateRoomSize(roomName, size);
        addMessage(`User ${nickname} has joined in this room`);
    });

    // fires when user leaves a room
    socket.on("bye", (nickname, roomName, size) => {
        updateRoomSize(roomName, size);
        addMessage(`User ${nickname} has left this this room`);
    });

    // fires when a message is sent
    socket.on('message', addMessage);
    
    // fires when the list of public rooms changes
    socket.on('rooms_changed', (publicRooms) => {
        roomList.innerHTML = "";
    
        const roomListItems = publicRooms.map(({ roomName, size }) => {
            const li = document.createElement("li");
            li.innerText = `${roomName} (${size})`;
            return li;
        });
    
        roomList.append(...roomListItems);
    });
};

const run = () => {
    const socket = io();

    setRoomEnterEvent(socket);

    setNickNameChangeEvent(socket);

    setIoEvents(socket);
};

run();
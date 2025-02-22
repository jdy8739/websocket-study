const socket = io();

const form = document.querySelector("form");

const input = form.querySelector("input");

form.addEventListener("submit", (event) => {
    event.preventDefault();

    socket.emit("enter_room", input.value, ({ roomName }) => {
        console.log(`welcome to ${roomName}`);
    });

    input.value = "";
});
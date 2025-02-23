const getDevices = async (callback) => {
    try {
        const devices = await callback();

        return devices;
    }   catch (error) {
        console.log(error);
    };
};


const getMedia = () => getDevices(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
    });
    
    return stream;
});

const getCameras = () => getDevices(async () => {
    const devices = await navigator.mediaDevices.enumerateDevices();
        
    const cameras = devices.filter((device) => device.kind === 'videoinput');
    
    return cameras;
});

const startStream = (steam) => {
    const myFace = document.getElementById('myFace');
    myFace.srcObject = steam;
}

const makeWebRTCConnection = async (stream) => {
    const myPeerConnection = new RTCPeerConnection();

    stream.getTracks().forEach((track) => {
        myPeerConnection.addTrack(track, stream);
    });

    return myPeerConnection;
};

const getCameraOptions = async () => {
    const cameras = await getCameras();

    const cameraOptions = cameras.map((camera) => {
        const option = document.createElement('option');

        option.value = camera.deviceId;

        option.innerText = camera.label;

        return option;
    });

    return cameraOptions;
};

const setCameraOptions = async () => {
    const cameraOptions = await getCameraOptions();

    const cameraSelect = document.getElementById('cameras');

    cameraSelect.append(...cameraOptions);
};

const setMuteToggleEvent = (audioTracks) => {
    const mute = document.getElementById('mute');

    mute.addEventListener('click', () => {
        const { enabled: currentEnabled } = audioTracks[0];

        audioTracks.forEach((track) => track.enabled = !currentEnabled);

        mute.innerText = currentEnabled ? 'Unmute' : 'Mute';
    });
};

const setCameraToggleEvent = (videoTracks) => {
    const camera = document.getElementById('camera');

    camera.addEventListener('click', () => {
        const { enabled: currentEnabled } = videoTracks[0];

        videoTracks.forEach((track) => track.enabled = !currentEnabled);

        camera.innerText = currentEnabled ? 'Turn Camera On' : 'Turn Camera Off';
    });
};

const setWelcomeEvent = (socket, myPeerConnection, roomName) => {
    socket.on('welcome', async () => {
        const offer = await myPeerConnection.createOffer();

        myPeerConnection.setLocalDescription(offer);

        setTimeout(() => {
            socket.emit('offer', offer, roomName);
        }, 100);
    });
};

const setOfferEvent = (socket, myPeerConnection, roomName) => {
    socket.on('offer', async (offer) => {
        myPeerConnection.setRemoteDescription(offer);

        const answer = await myPeerConnection.createAnswer();

        myPeerConnection.setLocalDescription(answer);

        socket.emit('answer', answer, roomName);
    });
};

const setAnswerEvent = (socket, myPeerConnection) => {
    socket.on('answer', async (answer) => {
        myPeerConnection.setRemoteDescription(answer);

        console.log('answer from server: ', answer);
    });
};

const showStreaming = async (socket, roomName) => {
    const myStream = await getMedia();

    startStream(myStream);

    const myPeerConnection = await makeWebRTCConnection(myStream);

    setOfferEvent(socket, myPeerConnection, roomName);

    setAnswerEvent(socket, myPeerConnection);

    setWelcomeEvent(socket, myPeerConnection, roomName);

    //

    setMuteToggleEvent(myStream.getAudioTracks());

    setCameraToggleEvent(myStream.getVideoTracks());

    setCameraOptions();
};

const setRoomEnterEvent = (socket, callbackAfterEnteringRoom) => {
    const roomForm = document.getElementById('welcome');

    const roomInput = roomForm.querySelector('input');

    const call = document.getElementById('call');

    roomForm.addEventListener('submit', (e) => {
        e.preventDefault();

        socket.emit('enter_room', roomInput.value, () => {
            roomForm.hidden = true;
            call.hidden = false;
            
            callbackAfterEnteringRoom(socket, roomInput.value);

            roomInput.value = '';
        });
    });
};

const run = async () => {
    const socket = io();

    // setOfferEvent(socket);
    
    setRoomEnterEvent(socket, showStreaming);
    
    // setWelcomeEvent(socket);
};

run();
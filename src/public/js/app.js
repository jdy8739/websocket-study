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

const startStream = (stream) => {
    const myFace = document.getElementById('myFace');
    myFace.srcObject = stream;
};

const makeWebRTCConnection = async () => new RTCPeerConnection();

const setWebRTCEvent = (myPeerConnection, socket, roomName) => {
    myPeerConnection.addEventListener('icecandidate', ({ candidate }) => {
        if (candidate) {
            socket.emit('icecandidate', candidate, roomName);
        }
    });

    myPeerConnection.addEventListener('addstream', ({ stream }) => {
        const video = document.createElement('video');

        const call = document.getElementById('call');

        video.autoplay = true;
        video.playsinline = true;
        video.style.width = '400px';
        video.style.height = '400px';
        video.srcObject = stream;

        call.append(video);
    });
};

const addTrackOnStream = (stream, myPeerConnection) => {
    stream.getTracks().forEach((track) => {
        myPeerConnection.addTrack(track, stream);
    });
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
        }, 300);
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
    });
};

const setIceCandidateEvent = (socket, myPeerConnection) => {
    socket.on('icecandidate', (candidate) => {
        myPeerConnection.addIceCandidate(candidate);
    });
};

const showStreaming = async (socket, roomName) => {
    const myStream = await getMedia();

    startStream(myStream);

    const myPeerConnection = await makeWebRTCConnection();

    setWebRTCEvent(myPeerConnection, socket, roomName);

    addTrackOnStream(myStream, myPeerConnection);

    setOfferEvent(socket, myPeerConnection, roomName);

    setAnswerEvent(socket, myPeerConnection);

    setWelcomeEvent(socket, myPeerConnection, roomName);

    setIceCandidateEvent(socket, myPeerConnection);

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

    setRoomEnterEvent(socket, showStreaming);
};

run();
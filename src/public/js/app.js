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

const getStream = async () => {
    const myFace = document.getElementById('myFace');

    const myStream = await getMedia();

    myFace.srcObject = myStream;

    return myStream;
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

const initStream = async () => {
    const myStream = await getStream();

    setMuteToggleEvent(myStream.getAudioTracks());

    setCameraToggleEvent(myStream.getVideoTracks());

    setCameraOptions();
};

const setRoomEnterEvent = (socket) => {
    const roomForm = document.getElementById('welcome');

    const roomInput = roomForm.querySelector('input');

    const call = document.getElementById('call');

    roomForm.addEventListener('submit', (e) => {
        e.preventDefault();

        socket.emit('enter_room', roomInput.value, () => {
            roomForm.hidden = true;
            call.hidden = false;

            roomInput.value = '';    
            
            initStream();
        });
    });
};

const setWelcomeEvent = (socket) => {
    socket.on('welcome', () => {
        console.log('Someone joined');
    });
};

const run = async () => {
    const socket = io();

    setRoomEnterEvent(socket);
    
    setWelcomeEvent(socket);
};

run();
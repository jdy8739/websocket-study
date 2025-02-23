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

const initStream = async () => {
    const myFace = document.getElementById('myFace');

    const myStream = await getMedia();

    myFace.srcObject = myStream;

    return myStream;
};

const setCameraOptions = async () => {
    const cameras = await getCameras();

    const camerasSelect = document.getElementById('cameras');

    const cameraOptions = cameras.map((camera) => {
        const option = document.createElement('option');

        option.value = camera.deviceId;

        option.innerText = camera.label;

        return option;
    });

    camerasSelect.append(...cameraOptions); // need implementing camera change event (3.2)  
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

const run = async () => {
    const myStream = await initStream();

    setMuteToggleEvent(myStream.getAudioTracks());

    setCameraToggleEvent(myStream.getVideoTracks());

    setCameraOptions();

    const socket = io();
};

run();
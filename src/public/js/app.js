const getDevices = async (callback) => {
    try {
        const devices = await callback();

        return devices;
    }   catch (e) {
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

const run = async () => {
    const socket = io();

    const myFace = document.getElementById('myFace');

    const myStream = await getMedia();

    myFace.srcObject = myStream;

    const mediaEnabledState = {
        audioOff: false,
        videoOff: false,
    };

    const mute = document.getElementById('mute');

    const camera = document.getElementById('camera');

    mute.addEventListener('click', () => {        
        if (mediaEnabledState.audioOff) {
            mute.innerText = 'Mute';
        } else {
            mute.innerText = 'Unmute';
        }

        mediaEnabledState.audioOff = !mediaEnabledState.audioOff;

        myStream
            .getAudioTracks()
            .forEach((track) => track.enabled = !mediaEnabledState.audioOff);
    });

    camera.addEventListener('click', () => {
        if (mediaEnabledState.videoOff) {
            camera.innerText = 'Turn Camera On';
        } else {
            camera.innerText = 'Turn Camera Off';
        }

        mediaEnabledState.videoOff = !mediaEnabledState.videoOff;

        myStream
            .getVideoTracks()
            .forEach((track) => track.enabled = !mediaEnabledState.videoOff);
    });

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

run();
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

const makeWebRTCConnection = () => new RTCPeerConnection();

const setWebRTCEvent = (myPeerConnection, socket, roomName) => {
    const call = document.getElementById('call');

    const msgButton = call.querySelector('#msg > button');

    myPeerConnection.addEventListener('track', ({ streams }) => {
        if (!myPeerConnection['stream']) {
            myPeerConnection['stream'] = streams[0];
        
            const video = document.createElement('video');

            video.autoplay = true;
            video.playsinline = true;
            video.style.width = '400px';
            video.style.height = '400px';
            video.srcObject = streams[0];

            call.append(video);
        }
    });

    myPeerConnection.addEventListener('icecandidate', ({ candidate }) => {
        if (candidate) {
            socket.emit('icecandidate', candidate, roomName);
        }
    });

    myPeerConnection.addEventListener('iceconnectionstatechange', () => {
        if (myPeerConnection.iceConnectionState === 'disconnected') {
            window.alert('Connection lost');

            msgButton.disabled = true;
            
            const peerVideo = call.querySelectorAll('video')[1];

            peerVideo.srcObject = null;
            peerVideo.remove();

            myPeerConnection['stream'] = null;
        }
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

const updateChat = (message) => {
    const chat = document.createElement('li');

    chat.innerText = message;

    document.querySelector('ul').append(chat);
};

const setChatEvent = (dataChannel) => {
    const msgForm = document.getElementById('msg');

    chatCallback = (e) => {
        e.preventDefault();

        const msgInput = msgForm.querySelector('input');

        updateChat(`me: ${msgInput.value}`);

        dataChannel.send(msgInput.value);

        msgInput.value = '';
    }

    msgForm.addEventListener('submit', chatCallback);
};

const setWelcomeEvent = (socket, myPeerConnection, roomName) => {
    socket.on('welcome', async () => {
        const dataChannel = myPeerConnection.createDataChannel('chat');

        if (!chatCallback) {
            setChatEvent(dataChannel);
        }

        const msgButton = document.querySelector('#call #msg button');

        msgButton.disabled = false;

        dataChannel.addEventListener('message', ({ data }) => updateChat(`peer: ${data}`));
        
        const offer = await myPeerConnection.createOffer();

        myPeerConnection.setLocalDescription(offer);

        setTimeout(() => {
            socket.emit('offer', offer, roomName);
        }, 300);
    });
};

const setOfferEvent = (socket, myPeerConnection, roomName) => {
    socket.on('offer', async (offer) => {
        myPeerConnection.addEventListener('datachannel', ({ channel }) => {

            setChatEvent(channel);

            const msgButton = document.querySelector('#call #msg button');

            msgButton.disabled = false;

            channel.addEventListener('message', ({ data }) => updateChat(`peer: ${data}`));
        });

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

const removePeerConnection = (peerConnection) => {
    peerConnection.getSenders().forEach(sender => {
        if (sender.track) sender.track.stop();
    });
  
    peerConnection.getReceivers().forEach(receiver => {
        if (receiver.track) receiver.track.stop();
      });
  
    // 모든 데이터 채널 닫기
    peerConnection.getDataChannels?.().forEach(channel => channel.close());

    // 연결 닫기
    peerConnection.close();  
}

const setLeaveRoomEvent = (socket, myPeerConnection, roomName) => {
    const roomForm = document.getElementById('welcome');

    const call = document.getElementById('call');

    const leaveButton = call.querySelector('div > div > button');

    const msgForm = document.getElementById('msg');

    leaveButton.addEventListener('click', () => {
        socket.emit('leave_room', roomName, () => {
            removePeerConnection(myPeerConnection);
            
            const msgButton = call.querySelector('#msg > button');

            msgButton.disabled = true;

            const ul = call.querySelector('ul');

            ul.innerHTML = '';

            const peerVideo = call.querySelectorAll('video')[1];

            if (peerVideo) {
                peerVideo.srcObject = null;
                peerVideo.remove();
            }

            msgForm.removeEventListener('submit', chatCallback);
            chatCallback = null;

            roomForm.hidden = false;
            call.hidden = true;
        });
    });
};

let chatCallback = null;

const setStreaming = async (socket, roomName) => {
    const myStream = await getMedia();

    startStream(myStream);

    const myPeerConnection = makeWebRTCConnection();

    setWebRTCEvent(myPeerConnection, socket, roomName);

    addTrackOnStream(myStream, myPeerConnection);

    setOfferEvent(socket, myPeerConnection, roomName);

    setAnswerEvent(socket, myPeerConnection);

    setWelcomeEvent(socket, myPeerConnection, roomName);

    setIceCandidateEvent(socket, myPeerConnection);

    setMuteToggleEvent(myStream.getAudioTracks());

    setCameraToggleEvent(myStream.getVideoTracks());

    // setCameraOptions();

    setLeaveRoomEvent(socket, myPeerConnection, roomName);
};

const enterRoom = (socket, roomName, callbackAfterEnteringRoom) => {
    socket.emit('enter_room', roomName, () => {
        callbackAfterEnteringRoom(socket, roomName);
    });
};

const setRoomEnterEvent = (socket) => {
    const roomForm = document.getElementById('welcome');

    const roomInput = roomForm.querySelector('input');

    const call = document.getElementById('call');

    roomForm.addEventListener('submit', (e) => {
        e.preventDefault();

         // check if the room is full
        socket.emit('check_room_is_full', roomInput.value, (isFull) => {
            if (isFull) {
                window.alert('This Room is full!');
            } else {
                enterRoom(socket, roomInput.value, () => {
                    roomForm.hidden = true;
                    call.hidden = false;
                    
                    setStreaming(socket, roomInput.value);

                    roomInput.value = '';
                });
            }
        });
    });
};

const run = () => setRoomEnterEvent(io());

run();
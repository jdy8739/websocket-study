# 🔥 Real-Time Communication Study
### WebSocket, Socket.io, WEbRTC 스터디 프로젝트

이 저장소는 WebSocket, Socket.io, WebRTC를 활용한 실시간 서비스 구현을 스터디하기 위해 만들어졌습니다.  
각 기술을 활용하여 채팅 및 화상 채팅 기능을 개발하며, 실시간 통신의 원리를 학습했습니다.  

---

## 📌 프로젝트 목표  
- WebSocket, Socket.io, WebRTC의 차이점과 특징을 학습  
- 각 기술을 활용한 **실시간 서비스** 개발  
- 실시간 채팅과 화상 채팅 기능 구현  

---

## 🚀 **주요 기능 (Features)**  

- **`ws` 브랜치 (순수 WebSocket)** 🔨  
  - WebSocket을 활용한 1:N 채팅방 구현  

- **`socket-io` 브랜치 (Socket.io 적용)** ✍  
  - 채팅방 기능 + 유저 세팅 기능 추가  
  - 채팅방 리스트 + 인원 수 표시  

- **`main` 브랜치 (WebRTC 활용)** 🏗  
  - WebRTC 기반 화상 채팅 서비스 구현  
  - P2P 연결을 통한 실시간 영상/음성 통신  
  - datachannel을 통한 메시지 전송 기능  

---

## 🛠 **기술 스택 (Tech Stack)**  

- **[WebSocket](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API)** - 브라우저와 서버 간의 실시간 양방향 통신을 위한 프로토콜  
- **[Socket.io](https://socket.io/)** - WebSocket 프로토콜을 추상화한 라이브러리  
- **[WebRTC](https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API)** - 서버를 통하지 않고 두 피어간의 직접 연결을 맺는 네트워크 기술    
- **[Node.js](https://nodejs.org/en)** - 간단한 정적 파일 서버 제공  

---

## 🚀 **설치 및 실행 방법 (Installation & Setup)**  

이 프로젝트를 실행하려면 **Node.js 20 이상**이 필요합니다.  
아래 명령어를 실행하여 프로젝트를 로컬에서 실행할 수 있습니다.  

```sh
# 의존성 설치
npm i

# NODE.JS 서버 구동
npm run dev
```

---

## 💡 배운 점 & 기술적 인사이트 (Learnings & Insights)  

🔹 Socket.io  
  - WebSocket이 불가능한 환경에서도 동작하도록 추상화되어 있다.  
  - WebSocket 기반이지만, Long Polling을 지원하여 더 안정적인 연결을 보장  
  
🔹 WebRTC  
  - 서버를 거치지 않고 P2P 연결을 통해 영상/음성 데이터를 주고받을 수 있다.  
  - 커넥션을 맺기 위해 사용자의 스트림을 얻고 오퍼/앤서를 교환 후 두 피어간의 잠재적 연결통로인 icecandidate를 교환하여 커넥션을 맺는다.  
  - STUN/TURN 서버 설정이 필요하며, 방화벽 이슈가 있을 수 있다.  
  - WebRTC가 제공하는 datachannel은 모든 종류의 미디어를 P2P로 전송할 수 있다.  

---

## 🔧 향후 개선점 (Improvements)  

🚧 카메라 선택 기능 추가  
다른 내장 카메라를 선택해도 카메라 변경이 적용되지 않는 점 수정  

🚧 버그 개선  
유저가 채팅방 재입장 시 `RTCDataChannel's ReadyState is not 'open'`라는 콘솔에러가 뜨며 채팅이 안되는 버그 수정  
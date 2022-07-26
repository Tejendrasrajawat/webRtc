import React, { useRef, useState } from "react";
import { firestore } from "./firebaseInit";

function App() {
  const webCamRef = useRef();
  const remoteRef = useRef();
  const callInputRef = useRef();
  const [disStatus, setDisStatus] = useState(false);

  // Global State
  const servers = {
    iceServers: [
      {
        urls: [
          "stun:stun1.l.google.com:19302",
          "stun:stun2.l.google.com:19302",
        ],
      },
    ],
    iceCandidatePoolSize: 10,
  };
  const pc = new RTCPeerConnection(servers);
  let localStream = null;
  let remoteStream = null;

  // HTML elements
  const webcamButton = document.getElementById("webcamButton");
  const webcamVideo = document.getElementById("webcamVideo");
  const callButton = document.getElementById("callButton");
  const callInput = document.getElementById("callInput");
  const answerButton = document.getElementById("answerButton");
  const remoteVideo = document.getElementById("remoteVideo");
  const hangupButton = document.getElementById("hangupButton");

  // 1. Setup media sources, add webCam and remoteCam
  const handleStartWebcam = async () => {
    localStream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    remoteStream = new MediaStream();

    // Push tracks from local stream to peer connection
    localStream.getTracks().forEach((track) => {
      pc.addTrack(track, localStream);
    });

    // Pull tracks from remote stream, add to video stream
    pc.ontrack = (event) => {
      event.streams[0].getTracks().forEach((track) => {
        remoteStream.addTrack(track);
      });
    };
    // show stream in html video
    webCamRef.current.srcObject = localStream;
    remoteRef.current.srcObject = remoteStream;

    setDisStatus(true);
  };

  // 2. Create an offer
  const handleCallButton = async () => {
    // Reference Firestore collections for signaling
    const callDoc = firestore.collection("calls").doc();
    const offerCandidates = callDoc.collection("offerCandidates");
    const answerCandidates = callDoc.collection("answerCandidates");

    callInputRef.current.value = callDoc.id;

    // Get candidates for caller, save to db
    pc.onicecandidate = (event) => {
      event.candidate && offerCandidates.add(event.candidate.toJSON());
    };

    // Create offer
    const offerDescription = await pc.createOffer();
    await pc.setLocalDescription(offerDescription);

    const offer = {
      sdp: offerDescription.sdp,
      type: offerDescription.type,
    };

    await callDoc.set({ offer });

    // Listen for remote answer
    callDoc.onSnapshot((snapshot) => {
      const data = snapshot.data();
      if (!pc.currentRemoteDescription && data?.answer) {
        const answerDescription = new RTCSessionDescription(data.answer);
        pc.setRemoteDescription(answerDescription);
      }
    });

    // When answered, add candidate to peer connection
    answerCandidates.onSnapshot((snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
          const candidate = new RTCIceCandidate(change.doc.data());
          pc.addIceCandidate(candidate);
        }
      });
    });
  };

  // 3. Answer the call with the unique ID
  const handleAnswerButton = async () => {
    const callId = callInputRef.current.value;
    const callDoc = firestore.collection("calls").doc(callId);
    const answerCandidates = callDoc.collection("answerCandidates");
    const offerCandidates = callDoc.collection("offerCandidates");

    pc.onicecandidate = (event) => {
      event.candidate && answerCandidates.add(event.candidate.toJSON());
    };

    const callData = (await callDoc.get()).data();

    const offerDescription = callData.offer;
    await pc.setRemoteDescription(new RTCSessionDescription(offerDescription));

    const answerDescription = await pc.createAnswer();
    await pc.setLocalDescription(answerDescription);

    const answer = {
      type: answerDescription.type,
      sdp: answerDescription.sdp,
    };

    await callDoc.update({ answer });

    offerCandidates.onSnapshot((snapshot) => {
      snapshot.docChanges().forEach((change) => {
        console.log(change);
        if (change.type === "added") {
          let data = change.doc.data();
          pc.addIceCandidate(new RTCIceCandidate(data));
        }
      });
    });
  };

  return (
    <>
      <h2>1. Start your Webcam</h2>
      <div className="videos">
        <span>
          <h3>Local Stream</h3>
          <video id="webcamVideo" ref={webCamRef} autoPlay playsInline></video>
        </span>
        <span>
          <h3>Remote Stream</h3>
          <video id="remoteVideo" ref={remoteRef} autoPlay playsInline></video>
        </span>
      </div>

      <button
        id="webcamButton"
        onClick={handleStartWebcam}
        disabled={disStatus ? true : false}
      >
        Start webcam
      </button>
      <h2>2. Create a new Call</h2>
      <button
        id="callButton"
        onClick={handleCallButton}
        disabled={disStatus ? false : true}
      >
        Create Call (offer)
      </button>

      <h2>3. Join a Call</h2>
      <p>Answer the call from a different browser window or device</p>

      <input id="callInput" ref={callInputRef} />
      <button
        id="answerButton"
        onClick={handleAnswerButton}
        disabled={disStatus ? false : true}
      >
        Answer
      </button>

      <h2>4. Hangup</h2>

      <button id="hangupButton" disabled={disStatus ? false : true}>
        Hangup
      </button>
    </>
  );
}

export default App;

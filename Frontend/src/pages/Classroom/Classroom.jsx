import React, { useEffect, useRef, useState, useContext } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import SimplePeer from "simple-peer";
import socket from "../../socket";
import config from "../../config";
import "./Classroom.css";

const Classroom = () => {
    const { roomId } = useParams(); // Using bookingId or unique room ID
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation(); // Import this!
    const studentIdFromState = location.state?.studentId; // Get ID passed from dashboard

    const [stream, setStream] = useState(null);
    const [receivingCall, setReceivingCall] = useState(false);
    const [caller, setCaller] = useState("");
    const [callerSignal, setCallerSignal] = useState(null);
    const [callAccepted, setCallAccepted] = useState(false);
    const [idToCall, setIdToCall] = useState("");
    const [callEnded, setCallEnded] = useState(false);
    const [name, setName] = useState("");
    const [isScreenSharing, setIsScreenSharing] = useState(false);
    const [name, setName] = useState("");
    const [isScreenSharing, setIsScreenSharing] = useState(false);
    const [isFullScreen, setIsFullScreen] = useState(false); // Remote Fullscreen
    const [isLocalFullScreen, setIsLocalFullScreen] = useState(false); // Local Fullscreen

    const myVideo = useRef();
    const userVideo = useRef();
    const connectionRef = useRef();
    const screenTrackRef = useRef();

    const [studentId, setStudentId] = useState(null);

    useEffect(() => {
        // Fetch Booking Details to know who the student is
        const fetchBookingDetails = async () => {
            try {
                // Fetch booking using roomId as bookingId
                const res = await fetch(`${config.API_BASE_URL}/api/booking/${roomId}`);
                const data = await res.json();
                if (data.success && data.booking) {
                    // Set student ID from DB (robust against refresh)
                    setStudentId(data.booking.studentId?._id);
                    console.log("🎓 Student identified:", data.booking.studentId?.name);
                }
            } catch (e) {
                console.error("Failed to fetch booking:", e);
            }
        };
        fetchBookingDetails();

        // Connect to Room
        socket.emit("join-room", roomId);

        // Get User Media
        navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((currentStream) => {
            setStream(currentStream);
            if (myVideo.current) {
                myVideo.current.srcObject = currentStream;
            }
        });

        // Listen for Incoming Calls
        socket.on("callUser", (data) => {
            setReceivingCall(true);
            setCaller(data.from);
            setName(data.name);
            setCallerSignal(data.signal);
        });
    }, [roomId]);

    const callUser = () => {
        // Teacher starts call
        const peer = new SimplePeer({
            initiator: true,
            trickle: false,
            stream: stream
        });

        peer.on("signal", (data) => {
            // Broadcast signal to everyone in room
            socket.emit("callUser", {
                roomId, // Send to room
                signalData: data,
                from: socket.id,
                name: user?.name || "Teacher"
            });
            console.log("Signal sent to room");
        });

        peer.on("stream", (currentStream) => {
            if (userVideo.current) {
                userVideo.current.srcObject = currentStream;
            }
        });

        socket.on("callAccepted", (signal) => {
            setCallAccepted(true);
            peer.signal(signal);
        });

        connectionRef.current = peer;
    };

    const answerCall = () => {
        setCallAccepted(true);
        const peer = new SimplePeer({
            initiator: false,
            trickle: false,
            stream: stream
        });

        peer.on("signal", (data) => {
            socket.emit("answerCall", { signal: data, to: caller });
        });

        peer.on("stream", (currentStream) => {
            if (userVideo.current) {
                userVideo.current.srcObject = currentStream;
            }
        });

        peer.signal(callerSignal);
        connectionRef.current = peer;
    };

    const leaveCall = () => {
        setCallEnded(true);
        if (connectionRef.current) {
            connectionRef.current.destroy(); // Destroy peer
        }
        // Stop my local stream tracks
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }
        navigate(-1); // Go back to dashboard instead of reload
    };

    // Screen Share Logic
    const toggleScreenShare = () => {
        if (!isScreenSharing) {
            navigator.mediaDevices.getDisplayMedia({ cursor: true }).then(displayStream => {
                const screenTrack = displayStream.getVideoTracks()[0];
                screenTrackRef.current = screenTrack;

                // Replace video track in peer connection
                if (connectionRef.current) {
                    const sender = connectionRef.current._pc.getSenders().find(s => s.track.kind === 'video');
                    sender.replaceTrack(screenTrack);
                }

                // Show local screen
                myVideo.current.srcObject = displayStream;
                setIsScreenSharing(true);

                screenTrack.onended = () => {
                    stopScreenShare();
                };
            });
        } else {
            stopScreenShare();
        }
    };

    const [micOn, setMicOn] = useState(true);
    const [videoOn, setVideoOn] = useState(true);
    const [speakerOn, setSpeakerOn] = useState(true);

    const toggleMic = () => {
        const audioTrack = stream.getAudioTracks()[0];
        if (audioTrack) {
            audioTrack.enabled = !audioTrack.enabled;
            setMicOn(audioTrack.enabled);
        }
    };

    const toggleVideo = () => {
        const videoTrack = stream.getVideoTracks()[0];
        if (videoTrack) {
            videoTrack.enabled = !videoTrack.enabled;
            setVideoOn(videoTrack.enabled);
        }
    };

    const toggleSpeaker = () => {
        if (userVideo.current) {
            userVideo.current.muted = !speakerOn; // Mute if speaker is turning off
            setSpeakerOn(!speakerOn);
        }
    };

    function stopScreenShare() {
        if (screenTrackRef.current) {
            screenTrackRef.current.stop();
        }
        // Switch back to camera
        const videoTrack = stream.getVideoTracks()[0];
        if (connectionRef.current) {
            const sender = connectionRef.current._pc.getSenders().find(s => s.track.kind === 'video');
            sender.replaceTrack(videoTrack);
        }
        myVideo.current.srcObject = stream;
        setIsScreenSharing(false);
    }

    return (
        <div className="classroom-container">
            <div className="video-grid">
                {/* My Video */}
                <div className={`video-card ${isLocalFullScreen ? 'fullscreen' : ''}`}>
                    <video playsInline muted ref={myVideo} autoPlay className="user-video" />
                    <p className="video-label">You</p>
                    <button
                        className="btn-icon expand-btn"
                        onClick={() => setIsLocalFullScreen(!isLocalFullScreen)}
                    >
                        {isLocalFullScreen ? "↘️" : "↗️"}
                    </button>
                </div>

                {/* Remote Video */}
                {callAccepted && !callEnded ? (
                    <div className={`video-card ${isFullScreen ? 'fullscreen' : ''}`}>
                        <video playsInline ref={userVideo} autoPlay className="user-video" />
                        <p className="video-label">{name || "Student"}</p>
                        <button
                            className="btn-icon expand-btn"
                            onClick={() => setIsFullScreen(!isFullScreen)}
                        >
                            {isFullScreen ? "↘️" : "↗️"}
                        </button>
                    </div>
                ) : (
                    <div className="video-card placeholder">
                        <p>Waiting for other person to join...</p>
                    </div>
                )}
            </div>

            <div className="controls-bar">
                {/* Call Controls Needed? */}
                {/* Simplified: Auto-join room. 
                    But simple-peer is p2p. One must "call" the other.
                    Let's add a "Start Class" button for Teacher?
                    Or just a "Join Now" if notification received? 
                */}

                {receivingCall && !callAccepted ? (
                    <div className="incoming-call-alert">
                        <p>{name} is ready!</p>
                        <button className="btn-primary" onClick={answerCall}>Join Class</button>
                    </div>
                ) : null}

                {/* If I am first, I might need to wait or "Call"?.
                    Let's assume Teacher initiates.
                    Or keep it simple: "Ready to Start?" -> Call Everyone in Room (Broadcast)
                */}

                {/* Only Teacher sees Start Class */}
                {!callAccepted && !receivingCall && user?.role === 'teacher' && (
                    <button className="btn-primary" onClick={() => {
                        // 1. Actually Start Call (WebRTC Peer)
                        callUser();

                        // 2. Notify Student (Send event to room/backend to alert student dashboard)
                        socket.emit("notify-start", {
                            roomId,
                            studentId: studentId || studentIdFromState, // Prefer DB fetch, fallback to state
                            teacherName: user?.name,
                            startTime: new Date().toLocaleTimeString()
                        });
                        alert("Class Started! Student has been notified.");
                    }}>
                        Start Class (Notify Student)
                    </button>
                )}

                <button className={`btn-icon ${!micOn ? 'danger' : ''}`} onClick={toggleMic}>
                    {micOn ? "🎙️ Mic On" : "🚫 Mic Off"}
                </button>

                <button className={`btn-icon ${!videoOn ? 'danger' : ''}`} onClick={toggleVideo}>
                    {videoOn ? "📷 Video On" : "🚫 Video Off"}
                </button>

                <button className={`btn-icon ${!speakerOn ? 'danger' : ''}`} onClick={toggleSpeaker}>
                    {speakerOn ? "🔊 Speaker On" : "🔇 Speaker Off"}
                </button>

                <button className="btn-icon" onClick={toggleScreenShare}>
                    {isScreenSharing ? "Stop Share" : "Share Screen"}
                </button>

                <button className="btn-icon danger" onClick={leaveCall}>
                    End Class
                </button>
            </div>
        </div>
    );
};

export default Classroom;

// import { useState, useRef } from 'react'
// import LocalVideo from '../assets/videoCall/localVideo';
// import RemoteVideo from '../assets/videoCall/remoteVideo';
// import MessagBox from '../assets/messaging/messageBox';
// import InputBox from '../assets/messaging/inputBox';
// import useSocket from '../hooks/useSocket';
// import usePeerConnection from '../hooks/usePeerConnection';
// import ConnectionStatusBar from '../assets/messaging/connectionStatusBar';
// import startWebRtcNegotiation from '../utils/startWebRtcNegotiation';
// import ChangeLocalMediaStream from '../assets/videoCall/changeCam'

// export default function ChatPage({ username, setUsername }) {

//     const [message, setMessage] = useState([])
//     const [peerConnection, setPeerConnection] = useState(null)
//     const [ChangeCamOverly, setChangeCamOverly] = useState(null)
//     const [updateUser, setUpdateUser] = useState(0)
//     const [stream, setStream] = useState(null)
//     const [selectedDeviceId, setSelectedDeviceId] = useState(null)
//     const [strangerdata, setStrangerData] = useState(null)
//     const localVideo = useRef(null)
//     const remoteVideo = useRef(null)
//     const { socket, strangerUserId, strangerUsername, connectionStatus } = useSocket(
//         username, remoteVideo.current, setMessage, updateUser, peerConnection, setPeerConnection, setStrangerData)

//     usePeerConnection(setPeerConnection)
//     startWebRtcNegotiation(socket, strangerdata, peerConnection, stream)

//     return (

//         <div id='chatPage'>
//             <div id='videoCall'>
//                 <ChangeLocalMediaStream
//                     peerConnection={peerConnection}
//                     localVideo={localVideo.current}
//                     ChangeCamOverly={ChangeCamOverly}
//                     setChangeCamOverly={setChangeCamOverly}
//                     selectedDeviceId={selectedDeviceId}
//                     setSelectedDeviceId={setSelectedDeviceId}
//                     setStream={setStream}
//                 />
//                 <LocalVideo
//                     localVideo={localVideo}
//                     peerConnection={peerConnection}
//                     setChangeCamOverly={setChangeCamOverly}
//                     setStream={setStream}
//                     stream={stream}
//                     selectedDeviceId={selectedDeviceId}
//                     socket={socket}
//                     strangerUserId={strangerUserId}
//                 />
//                 <RemoteVideo
//                     remoteVideo={remoteVideo}
//                     peerConnection={peerConnection}
//                     setChangeCamOverly={setChangeCamOverly}
//                 />
//             </div>
//             <div id='messaging'>
//                 <ConnectionStatusBar strangerUsername={strangerUsername} />
//                 <MessagBox
//                     message={message}
//                     username={username}
//                     socket={socket}
//                     setMessage={setMessage}
//                     strangerUsername={strangerUsername}
//                     strangerUserId={strangerUserId}
//                     connectionStatus={connectionStatus}
//                 />
//                 <InputBox
//                     socket={socket}
//                     setMessage={setMessage}
//                     setUsername={setUsername}
//                     setUpdateUser={setUpdateUser}
//                     strangerUserId={strangerUserId}
//                     username={username}
//                     strangerUsername={strangerUsername}
//                 />
//             </div>
//         </div>
//     )
// }

import { useState, useRef, useEffect } from 'react';
import LocalVideo from '../assets/videoCall/localVideo';
import RemoteVideo from '../assets/videoCall/remoteVideo';
import MessagBox from '../assets/messaging/messageBox';
import InputBox from '../assets/messaging/inputBox';
import useSocket from '../hooks/useSocket';
import usePeerConnection from '../hooks/usePeerConnection';
import ConnectionStatusBar from '../assets/messaging/connectionStatusBar';
import startWebRtcNegotiation from '../utils/startWebRtcNegotiation';
import ChangeLocalMediaStream from '../assets/videoCall/changeCam';

export default function ChatPage({ username, setUsername }) {
    const [message, setMessage] = useState([]);
    const [peerConnection, setPeerConnection] = useState(null);
    const [stream, setStream] = useState(null);
    const [selectedDeviceId, setSelectedDeviceId] = useState(null);
    const [interest, setInterest] = useState(""); // State for user's interest
    const [matchFound, setMatchFound] = useState(null); // State to track match status
    const localVideo = useRef(null);
    const remoteVideo = useRef(null);

    const { socket, strangerUserId, strangerUsername, connectionStatus } = useSocket(
        username, remoteVideo.current, setMessage, peerConnection, setPeerConnection
    );

    usePeerConnection(setPeerConnection);
    startWebRtcNegotiation(socket, strangerUserId, peerConnection, stream);

    // Send the interest to the server when it's set
    useEffect(() => {
        if (interest && socket) { // Ensure socket exists
            socket.emit('set-interest', { username, interest });
        }
    }, [interest, socket, username]);

    // Listen for match updates with null checks for socket
    useEffect(() => {
        if (socket) {
            // Listen for match-found event
            socket.on('match-found', (data) => {
                // Ensure data contains match and matchInterest
                if (data.match && data.matchInterest) {
                    // Only set matchFound if interests match
                    if (data.matchInterest === interest) {
                        setMatchFound(data.match);
                    } else {
                        // If interests don't match, reset the matchFound state
                        setMatchFound(null);
                    }
                }
            });

            // Listen for waiting-for-match event
            socket.on('waiting-for-match', () => {
                // Reset matchFound state if the user is still waiting for a match
                setMatchFound(null);
            });

            // Cleanup function to remove listeners on component unmount or socket change
            return () => {
                socket.off('match-found');
                socket.off('waiting-for-match');
            };
        }
    }, [socket, interest]);


    return (
        <div id="chatPage">
            <div id="videoCall">
                <ChangeLocalMediaStream
                    peerConnection={peerConnection}
                    localVideo={localVideo.current}
                    selectedDeviceId={selectedDeviceId}
                    setSelectedDeviceId={setSelectedDeviceId}
                    setStream={setStream}
                />
                <LocalVideo
                    localVideo={localVideo}
                    peerConnection={peerConnection}
                    setStream={setStream}
                    stream={stream}
                    selectedDeviceId={selectedDeviceId}
                    socket={socket}
                    strangerUserId={strangerUserId}
                />
                <RemoteVideo
                    remoteVideo={remoteVideo}
                    peerConnection={peerConnection}
                />
            </div>
            <div id="messaging">
                <ConnectionStatusBar strangerUsername={strangerUsername} />
                <MessagBox
                    message={message}
                    username={username}
                    socket={socket}
                    setMessage={setMessage}
                    strangerUsername={strangerUsername}
                    strangerUserId={strangerUserId}
                    connectionStatus={connectionStatus}
                />
                <InputBox
                    socket={socket}
                    setMessage={setMessage}
                    setUsername={setUsername}
                    strangerUserId={strangerUserId}
                    username={username}
                    strangerUsername={strangerUsername}
                />
                {/* Interest input and match status */}
                <div id="interest-section">
                    <h3>Set Your Interest</h3>
                    <input
                        type="text"
                        placeholder="Enter your interest"
                        value={interest}
                        onChange={(e) => setInterest(e.target.value)}
                    />
                    {matchFound !== null && (
                        <div id="matchStatus">
                            {matchFound ? (
                                <div>You have been matched with: {matchFound}</div>
                            ) : (
                                <div>Waiting for a match...</div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

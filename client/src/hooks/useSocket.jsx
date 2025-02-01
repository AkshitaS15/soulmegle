// import { useEffect, useState, useRef, PureComponent } from "react"
// import { io } from 'socket.io-client';
// import { useNavigate } from 'react-router-dom';
// import setPcInstance from "../utils/pcInstance";

// export default function useSocket(
//     username, remoteVideo, setMessage, updateUser, peerConnection, setPeerConnection, setStrangerData) {
//     const [socket, setSocket] = useState(null)
//     const [strangerUserId, setStrangerUserId] = useState('')
//     const [strangerUsername, setStrangerUsername] = useState(null)
//     const [connectionStatus, setConnectionStatus] = useState(false)
//     const [dummyStrangerUserId, setDummyStrangerUserId] = useState(null)
//     const [removePair, setRemovePair] = useState(false)

//     const nav = useNavigate()

//     useEffect(() => {
//         if (username) {
//             const newSocket = io(import.meta.env.VITE_APP_WEBSOCKET_URL, {
//                 transports: ['websocket'],
//                 auth: { username: username }
//             });
//             setSocket(newSocket);

//             return () => {
//                 newSocket.disconnect()
//                 setSocket(null)
//             }
//         }

//         !username && nav('/')

//     }, [username])

//     useEffect(() => {
//         if (socket && !strangerUsername) {
//             socket.emit('startConnection')
//             setRemovePair(true)
//         }
//     }, [socket, strangerUsername])


//     useEffect(() => {
//         if (socket) {
//             socket.on('getStragerData', (data) => {
//                 setStrangerData(data)
//                 setStrangerUserId(data.pairedUserId)
//                 setStrangerUsername(data.strangerUsername)
//                 setConnectionStatus(true)
//             })
//             socket.on('strangerLeftTheChat', clearState)
//             socket.on('errMakingPair', () => socket.emit('startConnection'))

//             return() => {
//                 socket.removeAllListeners('getStragerData')
//                 socket.removeAllListeners('strangerLeftTheChat')
//                 socket.removeAllListeners('errMakingPair')
//             }
//         }
//     }, [socket])

//     function clearState() {
//         setStrangerData(null)
//         setStrangerUserId('')
//         setStrangerUsername(null)
//         setConnectionStatus(false)
//         remoteVideo.srcObject = null
//         setMessage([])

//         if (peerConnection.signalingState !== 'closed') peerConnection.close()
//         const pcInstance = setPcInstance()
//         setPeerConnection(pcInstance)
//     }

//     useEffect(() => {
//         if (updateUser > 0) {
//             setDummyStrangerUserId(strangerUserId)
//             clearState()


//             return () => {
//                 setDummyStrangerUserId(null)
//             }
//         }
//     }, [updateUser])

//     useEffect(() => {
//         if (removePair && dummyStrangerUserId) socket.emit('pairedUserLeftTheChat', dummyStrangerUserId)
//     }, [removePair, dummyStrangerUserId])

//     useEffect(() => {
//         if (socket && !strangerUsername) {
//             window.addEventListener('beforeunload', () => socket.emit("soloUserLeftTheChat"))
//         } else {
//             window.addEventListener('beforeunload', () => socket.emit("pairedUserLeftTheChat", strangerUserId))
//         }
//     }, [socket, strangerUsername])

//     return { socket, strangerUserId, strangerUsername, connectionStatus };
// }

import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useNavigate } from "react-router-dom";
import setPcInstance from "../utils/pcInstance";


export default function useSocket(
    username,
    remoteVideo,
    setMessage,
    updateUser,
    peerConnection,
    setPeerConnection,
    setStrangerData
) {
    const [socket, setSocket] = useState(null);
    const [strangerUserId, setStrangerUserId] = useState("");
    const [strangerUsername, setStrangerUsername] = useState(null);
    const [connectionStatus, setConnectionStatus] = useState(false);
    const [dummyStrangerUserId, setDummyStrangerUserId] = useState(null);
    const [removePair, setRemovePair] = useState(false);

    const nav = useNavigate();


    // Initialize socket connection when username is available
    useEffect(() => {
        if (username) {
            const socket = io("http://localhost:4000", {
                transports: ["websocket"],
                withCredentials: true,
                reconnectionAttempts: 5, // Optional: Retry 5 times
                timeout: 5000,  // Send the username as authentication
            });
            setSocket(socket);

            return () => {
                socket.disconnect();
                setSocket(null);
            };
        }

        if (!username) nav("/"); // Redirect to login if no username
    }, [username]);

    // Emit start connection event when socket is ready and strangerUsername is not set
    useEffect(() => {
        if (socket && !strangerUsername) {
            console.log("Socket emitting: startConnection");
            socket.emit("startConnection");
            setRemovePair(true);
        }
    }, [socket, strangerUsername]);


    // Handle incoming socket events for pairing and data
    useEffect(() => {
        if (socket) {
            socket.on("getStragerData", (data) => {
                console.log("Received stranger data:", data);
                if (data) {
                    setStrangerData(data);
                    setStrangerUserId(data.pairedUserId);
                    setStrangerUsername(data.strangerUsername);
                    setConnectionStatus(true);
                } else {
                    console.error("Stranger data is undefined");
                }
            });

            socket.on("strangerLeftTheChat", clearState);
            socket.on("errMakingPair", () => {
                console.error("Error making pair, retrying...");
                socket.emit("startConnection");
            });

            return () => {
                socket.removeAllListeners("getStragerData");
                socket.removeAllListeners("strangerLeftTheChat");
                socket.removeAllListeners("errMakingPair");
            };
        }
    }, [socket]);

    // Clear state when the stranger leaves or any issue occurs
    const clearState = () => {
        console.log("Clearing state...");
        setStrangerData(null);
        setStrangerUserId("");
        setStrangerUsername(null);
        setConnectionStatus(false);
        remoteVideo.srcObject = null;
        setMessage([]);

        if (peerConnection.signalingState !== "closed") peerConnection.close();
        const pcInstance = setPcInstance();
        setPeerConnection(pcInstance);
    };

    // Handle update to user pairing
    useEffect(() => {
        if (updateUser > 0) {
            setDummyStrangerUserId(strangerUserId);
            clearState();

            return () => {
                setDummyStrangerUserId(null);
            };
        }
    }, [updateUser]);

    // Handle removal of paired user
    useEffect(() => {
        if (removePair && dummyStrangerUserId) {
            console.log("Socket emitting: pairedUserLeftTheChat", dummyStrangerUserId);
            socket.emit("pairedUserLeftTheChat", dummyStrangerUserId);
        }
    }, [removePair, dummyStrangerUserId]);

    // Cleanup socket connection on window close or refresh
    useEffect(() => {
        const handleBeforeUnload = () => {
            if (socket) {
                if (!strangerUsername) {
                    console.log("Socket emitting: soloUserLeftTheChat");
                    socket.emit("soloUserLeftTheChat");
                } else {
                    console.log("Socket emitting: pairedUserLeftTheChat", strangerUserId);
                    socket.emit("pairedUserLeftTheChat", strangerUserId);
                }
            }
        };

        window.addEventListener("beforeunload", handleBeforeUnload);

        return () => {
            window.removeEventListener("beforeunload", handleBeforeUnload);
        };
    }, [socket, strangerUsername, strangerUserId]);

    return {
        socket,
        strangerUserId,
        strangerUsername,
        connectionStatus,
    };
}

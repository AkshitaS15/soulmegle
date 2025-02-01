// // import { useState } from "react";
// // import { createBrowserRouter, RouterProvider } from "react-router-dom";
// // import SingUp from "./SingUp";
// // import ChatPage from "./ChatPage";


// // function App() {

// //   const [username, setUsername] = useState(null)

// //   const router = createBrowserRouter([
// //     {
// //       path: '/',
// //       element: <SingUp setUsername={setUsername} />,
// //     },
// //     {
// //       path: '/chat',
// //       element: <ChatPage 
// //       username ={username} 
// //       setUsername={setUsername}  
// //       />
// //     }
// //   ]);

// //   return <RouterProvider router={router} />;
// // }

// // export default App;

// import { useState, useEffect } from "react";
// import { createBrowserRouter, RouterProvider } from "react-router-dom";
// import SingUp from "./SingUp";
// import ChatPage from "./ChatPage";
// import { io } from 'socket.io-client';

// function App() {
//   const [username, setUsername] = useState(null);
//   const [interest, setInterest] = useState('');
//   const [message, setMessage] = useState('');
//   const [socket, setSocket] = useState(null);

//   // Initialize socket connection
//   useEffect(() => {
//     const newSocket = io('http://localhost:3000'); // Replace with your server URL if needed
//     setSocket(newSocket);

//     // Cleanup on unmount
//     return () => {
//       newSocket.disconnect();
//     };
//   }, []);

//   useEffect(() => {
//     if (!socket) return;

//     // Listen for server events to notify match status
//     socket.on('match-found', (data) => {
//       alert(`You have been matched with user: ${data.match}`);
//     });

//     socket.on('waiting-for-match', (data) => {
//       setMessage(data.message);
//     });

//     // Cleanup the listeners on component unmount
//     return () => {
//       socket.off('match-found');
//       socket.off('waiting-for-match');
//     };
//   }, [socket]);

//   const handleInterestSubmit = () => {
//     if (interest) {
//       // Emit the interest to the server
//       socket.emit('set-interest', { username, interest });
//       setMessage('Looking for a match...');
//     } else {
//       alert('Please enter your interest');
//     }
//   };

//   const router = createBrowserRouter([
//     {
//       path: '/',
//       element: <SingUp setUsername={setUsername} />,
//     },
//     {
//       path: '/chat',
//       element: (
//         <ChatPage
//           username={username}
//           setUsername={setUsername}
//           interest={interest}
//           setInterest={setInterest}
//           handleInterestSubmit={handleInterestSubmit}
//           message={message}
//         />
//       ),
//     },
//   ]);

//   return <RouterProvider router={router} />;
// }

// export default App;

// App.jsx
// App.jsx
// App.jsx
import { useState, useEffect } from "react";
import { createBrowserRouter, RouterProvider, useNavigate, Navigate } from "react-router-dom";
import SingUp from "./SingUp";
import ChatPage from "./ChatPage";
import { io } from "socket.io-client";

function App() {
  const [username, setUsername] = useState(localStorage.getItem('username') || null);
  const [interest, setInterest] = useState("");
  const [message, setMessage] = useState("");
  const [socket, setSocket] = useState(null);

  const setInterestFromSignUp = (interestFromSignUp) => {
    setInterest(interestFromSignUp);
  };

  useEffect(() => {
    if (username) {
      const socketUrl = import.meta.env.VITE_REACT_APP_WEBSOCKET_URL || "ws://localhost:4000";

      const newSocket = io(socketUrl, {
        transports: ["websocket"],
        withCredentials: true,
        auth: { username },
      });

      setSocket(newSocket);

      newSocket.on("connect", () => {
        console.log("Socket connected successfully!");
        if (interest) {
          newSocket.emit("set-interest", { interest }, () => {
            console.log("set-interest emitted after connect:", interest);
          });
        }
      });

      newSocket.on("connect_error", (err) => {
        console.error("Socket connection error:", err);
        if (err.message === "invalid username") {
          setUsername(null);
          localStorage.removeItem('username');
          alert("Invalid username. Please login again.");
        }
      });

      return () => {
        newSocket.disconnect();
        console.log("Socket disconnected.");
      };
    } else {
      console.log("Username is not available yet.");
    }
  }, [username, interest]); // Add interest to dependency array


  useEffect(() => {
    if (!socket) return;

    socket.on("match-found", (data) => {
      console.log("Match found data:", data);
      alert(
        `You have been matched with user: ${data.partnerId} who has interest: ${data.partnerInterest}`
      );
      setMessage(`Matched with ${data.partnerId}`);
    });

    socket.on("waiting-for-match", () => {
      setMessage("Waiting for a match...");
    });

    return () => {
      socket.off("match-found");
      socket.off("waiting-for-match");
    };
  }, [socket]);

  const handleInterestSubmit = () => {
    if (interest && socket) {
      socket.emit("findMatch", { interest }, () => {
        console.log("findMatch emitted:", interest);
      });
      setMessage("Looking for a match...");
    } else {
      alert("Please enter your interest");
    }
  };

  const router = createBrowserRouter([
    {
      path: "/",
      element: <SingUp setUsername={setUsername} setInterestFromSignUp={setInterestFromSignUp} />,
    },
    {
      path: "/chat",
      element: username ? (
        <ChatPage
          username={username}
          setUsername={setUsername}
          interest={interest}
          setInterest={setInterest}
          handleInterestSubmit={handleInterestSubmit}
          message={message}
        />
      ) : (
        <Navigate to="/" replace />
      ),
    },
  ]);

  return (
    <RouterProvider router={router} />
  );
}

export default App;
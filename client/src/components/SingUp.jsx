// import { useNavigate} from "react-router-dom"
// export default function SingUp({ setUsername }) {
//   const naviagte = useNavigate()

//   function usernameSubmit(e) {
//     e.preventDefault()
//     if (e.target[0].value) {
//       setUsername(e.target[0].value)
//       naviagte("/chat")
//     } else {
//       alert("You Forgot To Add Your Name")
//     }
//   }

//   return (
//     <div id="signupPage">
//       <h1 id="OmegelCloneHeading">Omegle Clone</h1>
//       <form onSubmit={usernameSubmit}>
//         <input type="text" className="singupInputBox" placeholder='Enter Your Name' />
//         <input type="submit" className="singupInputBox" id="signupSubmitBtn" value="Start Chat" />
//       </form>
//     </div>
//   )
// }
// SingUp.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import io from "socket.io-client";

export default function SingUp({ setUsername, setInterestFromSignUp }) {
  const navigate = useNavigate();
  const [interest, setInterest] = useState("");
  const [socket, setSocket] = useState(null);
  const [usernameInput, setUsernameInput] = useState(""); // Store input value

  useEffect(() => {
    const socketInstance = io("http://localhost:4000", {
      transports: ["websocket"],
      withCredentials: true,
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  function usernameSubmit(e) {
    e.preventDefault();

    if (usernameInput && interest && socket) { // Use usernameInput state
      setUsername(usernameInput);
      setInterestFromSignUp(interest);

      socket.emit("set-interest", { interest }, () => {
        console.log("set-interest emitted:", interest);
      });

      navigate("/chat");
    } else {
      alert("You Forgot To Add Your Name or Interest");
    }
  }

  return (
    <div id="signupPage">
      <h1 id="OmegleCloneHeading">Omegle Clone</h1>
      <form onSubmit={usernameSubmit}>
        <input
          type="text"
          className="singupInputBox"
          placeholder="Enter Your Name"
          value={usernameInput} // Bind input to state
          onChange={(e) => setUsernameInput(e.target.value)} // Update state on change
          id="usernameInput" // Add ID for accessibility
          name="username" // Add name for browser autofill
        />
        <input
          type="text"
          className="singupInputBox"
          placeholder="Enter Your Interest"
          value={interest}
          onChange={(e) => setInterest(e.target.value)}
          id="interestInput" // Add ID for accessibility
          name="interest" // Add name for browser autofill
        />
        <input
          type="submit"
          className="singupInputBox"
          id="signupSubmitBtn"
          value="Start Chat"
        />
      </form>
    </div>
  );
}
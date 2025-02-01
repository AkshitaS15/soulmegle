// import { processUserPairing, soloUserLeftTheChat } from "./userConstroller/userController.js"

// export function handelSocketConnection(io, socket) {
//     // pairing
//     socket.on("startConnection", () => processUserPairing(io, socket))
//     socket.on("pairedUserLeftTheChat", to => io.to(to).emit("strangerLeftTheChat"))
//     socket.on("soloUserLeftTheChat", () => soloUserLeftTheChat(socket))

//     // exchanging video call data(offer and answer)
//     socket.on('message', m => io.to(m.to).emit('message', m));

//     // private message
//     socket.on("private message", ({ content, to }) => io.to(to).emit("private message", {
//         content: content,
//         from: socket.id,
//     }))

//     socket.on('disconnect', () => {
//         try {
//             socket.removeAllListeners('startConnection');
//             socket.removeAllListeners('pairedUserLeftTheChat');
//             socket.removeAllListeners('soloUserLeftTheChat');
//             socket.removeAllListeners('message');
//             socket.removeAllListeners('private message');
//         } catch (error) {
//             console.error(error);
//         }
//     })
// }
import { processUserPairing, soloUserLeftTheChat } from "./userController/userController.js";
;

export function handelSocketConnection(io, socket) {
    // Pairing
    socket.on("startConnection", (userInterests) => {
        // Pass interests to processUserPairing for interest-based pairing
        socket.interests = userInterests; // Store interests on the socket object
        processUserPairing(io, socket); // Proceed with pairing
    });

    socket.on("pairedUserLeftTheChat", (to) => io.to(to).emit("strangerLeftTheChat"));
    socket.on("soloUserLeftTheChat", () => soloUserLeftTheChat(socket));

    // Exchanging video call data (offer and answer)
    socket.on('message', (m) => io.to(m.to).emit('message', m));

    // Private message
    socket.on("private message", ({ content, to }) => io.to(to).emit("private message", {
        content: content,
        from: socket.id,
    }));

    // Disconnect handler
    socket.on('disconnect', () => {
        try {
            socket.removeAllListeners('startConnection');
            socket.removeAllListeners('pairedUserLeftTheChat');
            socket.removeAllListeners('soloUserLeftTheChat');
            socket.removeAllListeners('message');
            socket.removeAllListeners('private message');
        } catch (error) {
            console.error(error);
        }
    });
}

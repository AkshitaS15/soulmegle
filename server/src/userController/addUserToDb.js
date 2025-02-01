import client from "../redisClient.js";

// export default async function addUserTODb(socket) {
//     try {
//         const result = await client.rPush("users", JSON.stringify({
//             socketId: socket.id,
//             username: socket.username
//         }));
//         console.log("added", socket.username, "to redis", result);
//     } catch (err) {
//         console.log("err adding user to redis", err);
//         socket.emit("errSelectingPair");
//     }
// }
export default async function addUserTODb(socket) {
    try {
        // Example: Assuming socket has an 'interests' field
        const userData = {
            socketId: socket.id,
            username: socket.username,
            interests: socket.interests || []  // Capture interests or default to an empty array
        };

        const result = await client.rPush("users", JSON.stringify(userData));
        console.log("added", socket.username, "to redis", result);
    } catch (err) {
        console.log("err adding user to redis", err);
        socket.emit("errSelectingPair");
    }
}

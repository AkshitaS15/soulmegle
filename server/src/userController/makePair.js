import client from "../redisClient.js";
import addUserToDb from "./addUserToDb.js";

function createUserPair(socket, randomUserData) {
    const user1 = {
        socketId: socket.id,
        username: socket.username,
        polite: true,
        pairedUserId: randomUserData.socketId,
        strangerUsername: randomUserData.username,
    };
    const user2 = {
        socketId: randomUserData.socketId,
        username: randomUserData.username,
        polite: false,
        pairedUserId: socket.id,
        strangerUsername: socket.username,
    };
    return [user1, user2];
}

export default async function makePair(len, socket) {
    const getRandomIndex = () => Math.floor(Math.random() * len);
    const strangerIndex = getRandomIndex();

    try {
        const randomUserData = await client.lIndex("users", strangerIndex);
        if (!randomUserData) {
            socket.emit("errMakingPair", "No user found");
            return null;
        }

        const parsedUserData = JSON.parse(randomUserData);

        if (socket.id === parsedUserData.socketId) {
            console.log("Same user detected, re-adding to queue.");
            socket.emit("waiting", "Waiting for another user to join");
            addUserToDb(socket);
            return null;
        }

        const removedCount = await client.lRem("users", 1, randomUserData);
        if (removedCount === 0) {
            socket.emit("errMakingPair", "User no longer available");
            return null;
        }

        const users = createUserPair(socket, parsedUserData);
        console.log(`Selected pair ${users[0].username} with ${users[1].username}`);

        return users;

    } catch (err) {
        console.error("Error making pair:", err);
        socket.emit("errMakingPair", "Internal server error");
        return null;
    }
}

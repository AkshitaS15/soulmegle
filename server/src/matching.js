// import * as vectorious from 'vectorious';
// import { getEmbedding } from "./gemini.js";
// import { getAllUsers, storeUserInterest } from "./redisClient.js";

// export async function findBestMatch(userId, interest) {
//     const userEmbedding = await getEmbedding(interest);
//     await storeUserInterest(userId, interest, userEmbedding);

//     const users = await getAllUsers();
//     let bestMatch = null;
//     let highestSimilarity = -1;

//     for (const user of users) {
//         if (user.userId !== userId) {
//             const similarity = 1 - distance(userEmbedding, user.embedding, "cosine");

//             if (similarity > highestSimilarity) {
//                 highestSimilarity = similarity;
//                 bestMatch = user.userId;
//             }
//         }
//     }


//     const Vector = vectorious.Vector;  // Access the Vector class from the module
//     const vector1 = new Vector([1, 2, 3]);
//     const vector2 = new Vector([4, 5, 6]);

//     const distance = vector1.distance(vector2);
//     console.log(distance);  // Outputs the Euclidean distance between the vectors


//     return bestMatch;
// }
import client from './redisClient.js';

/**
 * Finds the best match for a user based on their interest.
 * Uses Redis sets for efficient interest-based lookups.
 * @param {string} requesterId - The socket.id of the requester.
 * @param {string} interest - The interest to match.
 * @returns {Promise<string|null>} - Returns the socket ID of the matching user or null if no match is found.
 */
export async function findBestMatch(requesterId, interest) {
    try {
        const interestSetKey = `interest:${interest}`; // Key for the Redis set

        // 1. Check if the set exists (optimization)
        const setExists = await client.exists(interestSetKey);
        if (!setExists) {
            return null; // No users with this interest
        }

        // 2. Get all users with the specified interest from the set
        const usersWithInterest = await client.sMembers(interestSetKey);

        // 3. Filter out the requester and any users who are already matched (if you have a way to track that)
        const potentialMatches = usersWithInterest.filter(userId => userId !== requesterId);

        if (potentialMatches.length > 0) {
            // 4. Choose a random match (or implement a more sophisticated matching algorithm)
            const randomIndex = Math.floor(Math.random() * potentialMatches.length);
            const matchId = potentialMatches[randomIndex];
            return matchId;
        } else {
            return null; // No match found
        }
    } catch (error) {
        console.error('Error in findBestMatch:', error);
        return null;
    }
}

/**
 * Stores a user's interest in Redis using their socket ID and adds them to an interest set.
 * @param {string} socketId - The unique socket ID of the user.
 * @param {string} interest - The interest to store.
 */
export async function storeUserInterest(socketId, interest) {
    try {
        const interestSetKey = `interest:${interest}`;
        await client.set(socketId, interest); // Store interest associated with socket.id
        await client.sadd(interestSetKey, socketId); // Add socket.id to the interest set
        console.log(`Interest for ${socketId} stored successfully as "${interest}" and added to set "${interestSetKey}"`);
    } catch (error) {
        console.error('Error storing user interest:', error);
    }
}

/**
 * Removes a user's interest from Redis and their interest set when they disconnect.
 * @param {string} socketId - The unique socket ID of the user.
 * @param {string} interest - The interest to remove.
 */
export async function removeUserInterest(socketId, interest) {
    try {
        const interestSetKey = `interest:${interest}`;
        await client.del(socketId); // Remove interest associated with socket.id
        await client.srem(interestSetKey, socketId); // Remove socket.id from the interest set
        console.log(`Interest for ${socketId} removed from Redis.`);
    } catch (error) {
        console.error('Error removing user interest:', error);
    }
}
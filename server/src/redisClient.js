// import { createClient } from 'redis';
// import 'dotenv/config'

// const client = createClient({
//   password: process.env.REDIS_PWD,
//   socket: {
//     host: process.env.REDIS_HOST,
//     port: process.env.REDIS_PORT
//   }
// });




// export default client

// import { createClient } from "redis";

// const client = createClient({
//   url: process.env.REDIS_URL || "redis://127.0.0.1:6379"
// });

// client.on("error", (err) => console.log("Redis Error:", err));

// // Use async IIFE to handle the connection
// (async () => {
//   try {
//     await client.connect();
//     console.log("Connected to Redis");
//   } catch (error) {
//     console.error("Error connecting to Redis:", error);
//   }
// })();

// export async function storeUserInterest(userId, interest, embedding) {
//   try {
//     await client.hSet(`user:${userId}`, {
//       interest: interest,
//       embedding: JSON.stringify(embedding),
//     });
//   } catch (error) {
//     console.error("Error storing user interest:", error);
//   }
// }

// export async function getAllUsers() {
//   try {
//     const keys = await client.keys("user:*");
//     const users = [];

//     for (const key of keys) {
//       const user = await client.hGetAll(key);
//       user.embedding = JSON.parse(user.embedding);
//       user.userId = key.split(":")[1];
//       users.push(user);
//     }
//     return users;
//   } catch (error) {
//     console.error("Error fetching all users:", error);
//   }
// }

// export async function deleteUser(userId) {
//   try {
//     await client.del(`user:${userId}`);
//   } catch (error) {
//     console.error("Error deleting user:", error);
//   }
// }

// export default client;
import { createClient } from 'redis';

// Create the Redis client instance
const client = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379' // Use an environment variable for URL (default to localhost)
});

// Listen for errors on the Redis client
client.on('error', (err) => {
  console.log('Redis Client Error:', err);
});

// Connect to Redis
async function connectToRedis() {
  try {
    await client.connect();
    console.log('Connected to Redis');
  } catch (error) {
    console.error('Failed to connect to Redis:', error);
    setTimeout(connectToRedis, 5000); // Retry connection after 5 seconds if failed
  }
}

connectToRedis();

// Store the user's interest in Redis
export const storeUserInterest = async (username, interest) => {
  try {
    await client.set(username, interest);
    console.log(`Interest for ${username} stored successfully.`);
  } catch (error) {
    console.error("Error storing interest in Redis:", error);
  }
};

// Get user's interest from Redis
export const getUserInterest = async (username) => {
  try {
    const interest = await client.get(username);
    return interest;
  } catch (error) {
    console.error("Error fetching interest from Redis:", error);
    return null;
  }
};

// Delete user data from Redis
export const deleteUser = async (username) => {
  try {
    await client.del(username);
    console.log(`User ${username} deleted successfully.`);
  } catch (error) {
    console.error("Error deleting user from Redis:", error);
  }
};

export default client;

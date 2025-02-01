// import express from "express";
// import { createServer } from "http";
// import { Server } from "socket.io";
// import client from "./src/redisClient.js";
// import { handelSocketConnection } from "./src/socketRoutes.js";
// import { findBestMatch } from "./src/matching.js";
// import { deleteUser } from "./src/redisClient.js";
// import 'dotenv/config';

// const app = express();
// const httpServer = createServer(app);

// const io = new Server(httpServer, {
//   cors: {
//     origin: process.env.PUBLIC_WEBSOCKET_URL || "http://localhost:5173"
//   }
// });

// io.use((socket, next) => {
//   const username = socket.handshake.auth.username;
//   if (!username) {
//     return next(new Error("invalid username"));
//   }
//   socket.username = username;
//   next();
// });

// // Check if Redis is already connected before connecting
// if (!client.isOpen) {
//   client.connect()
//     .then(() => console.log("Database connected"))
//     .catch(err => console.log("Error connecting to DB:", err));
// }

// io.on("connection", (socket) => {
//   console.log("A user connected:", socket.id);

//   // Handle interest-based matching
//   socket.on("findMatch", async ({ userId, interest }) => {
//     const match = await findBestMatch(userId, interest);

//     if (match) {
//       socket.emit("matchFound", { partnerId: match });
//       io.to(match).emit("matchFound", { partnerId: socket.id });

//       // Remove matched users from Redis to prevent duplicate matches
//       await deleteUser(userId);
//       await deleteUser(match);
//     } else {
//       socket.emit("waitingForMatch");
//     }
//   });

//   socket.on("disconnect", async () => {
//     console.log("User disconnected:", socket.id);
//     await deleteUser(socket.id);
//   });

//   handelSocketConnection(io, socket);
// });

// httpServer.listen(process.env.PORT, () => console.log("Port running at", process.env.PORT));

// import express from 'express';
// import { createServer } from 'http';
// import { Server } from 'socket.io';
// import cors from 'cors';  // Import the cors package
// import client from "./src/redisClient.js";
// import { handelSocketConnection } from "./src/socketRoutes.js";
// import { findBestMatch } from "./src/matching.js";
// import { deleteUser, storeUserInterest } from "./src/redisClient.js";
// import 'dotenv/config';

// const app = express();
// const httpServer = createServer(app);

// // Enable CORS using express middleware
// app.use(cors({
//   origin: 'http://localhost:5173', // Without the trailing slash
//   methods: ['GET', 'POST'],
//   allowedHeaders: ['Content-Type'],
//   credentials: true
// }));

// // Create Socket.io server with CORS configuration
// const io = new Server(httpServer, {
//   cors: {
//     origin: 'http://localhost:5173', // Specify the exact origin of your frontend
//     methods: ['GET', 'POST'],
//     allowedHeaders: ['Content-Type'],
//     credentials: true
//   }
// });

// // Middleware to check if username exists in handshake
// io.use((socket, next) => {
//   const username = socket.handshake.auth.username;
//   if (!username) {
//     return next(new Error('Invalid username'));
//   }
//   socket.username = username;
//   next();
// });

// // Check if Redis is connected, and connect if necessary
// if (!client.isOpen) {
//   client.connect()
//     .then(() => console.log('Database connected'))
//     .catch(err => console.log('Error connecting to DB:', err));
// }

// // Handle incoming connections
// io.on('connection', (socket) => {
//   console.log('A user connected:', socket.id);

//   // Store user interest on connection
//   socket.on('set-interest', async ({ interest }) => {
//     try {
//       // Save user interest in Redis
//       await storeUserInterest(socket.username, interest);
//       console.log(`Interest for ${socket.username} set to ${interest}`);
//     } catch (error) {
//       console.log('Error setting interest:', error);
//     }
//   });

//   // Handle find match event based on interest
//   socket.on('findMatch', async ({ userId, interest }) => {
//     console.log(`User ${userId} is looking for a match with interest: ${interest}`);

//     const match = await findBestMatch(userId, interest);  // Find the match based on interest

//     if (match) {
//       // Get the interest of the matched user (matchInterest)
//       const matchInterest = await client.get(match);
//       socket.emit('match-found', { match, matchInterest });
//       io.to(match).emit('match-found', { match: userId, matchInterest: interest });
//     } else {
//       socket.emit('waiting-for-match');
//     }
//   });

//   socket.on('disconnect', async () => {
//     console.log('User disconnected:', socket.id);

//     try {
//       // Optionally remove user from Redis when disconnected
//       await deleteUser(socket.id);
//     } catch (error) {
//       console.error('Error deleting user on disconnect:', error);
//     }
//   });

//   // Other socket-related connections
//   handelSocketConnection(io, socket);  // This already handles more socket events
// });

// // Start the server on the specified port
// httpServer.listen(process.env.PORT, () => {
//   console.log(`Server is running on port ${process.env.PORT}`);
// });

// server.js
// server.js
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import client, { deleteUser, storeUserInterest } from "./src/redisClient.js";
import { handelSocketConnection } from "./src/socketRoutes.js";
import { findBestMatch } from "./src/matching.js";
import 'dotenv/config';

// Use environment variables or fallback to defaults
const PORT = 4000; // Ensuring server runs on port 4000
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || 'http://localhost:5173';

const app = express();
const httpServer = createServer(app);
httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`Server started on port ${PORT}`);
});

// Enable CORS for HTTP routes
app.use(cors({
  origin: FRONTEND_ORIGIN,
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
  credentials: true
}));

app.get('/', (req, res) => {
  res.send('Server is running!');
});

// Create Socket.io server with CORS configuration
const io = new Server(httpServer, {
  cors: {
    origin: FRONTEND_ORIGIN, // Updated to use your frontend URL
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Middleware: Ensure a username is provided in the handshake
io.use((socket, next) => {
  const username = socket.handshake.auth.username;
  if (!username) {
    return next(new Error('Invalid username'));
  }
  socket.username = username; // Attach username if needed
  next();
});

// Connect to Redis if not already connected
if (!client.isOpen) {
  client.connect()
    .then(() => console.log('Connected to Redis'))
    .catch(err => console.error('Error connecting to DB:', err));
}

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // When the user clicks "start chat" and sends their interest
  socket.on('startChat', async ({ interest }) => {
    try {
      // Store the user's interest in Redis (using socket.id as the key)
      await storeUserInterest(socket.id, interest);
      console.log(`Interest for ${socket.id} stored successfully as "${interest}"`);

      // Attempt to find a matching user with the same interest
      const match = await findBestMatch(socket.id, interest);
      if (match) {
        // Retrieve the matched user's interest from Redis for confirmation
        const matchInterest = await client.get(match);
        if (matchInterest === interest) {
          // Create a unique room identifier by combining the socket IDs
          const roomId = `room-${socket.id}-${match}`;

          // Make both sockets join the same room
          socket.join(roomId);
          const matchedSocket = io.sockets.sockets.get(match);
          if (matchedSocket) {
            matchedSocket.join(roomId);
          }

          // Notify both users that a match is found along with the room identifier
          socket.emit('match-found', { partnerId: match, roomId });
          io.to(match).emit('match-found', { partnerId: socket.id, roomId });
          console.log(`Matched ${socket.id} with ${match} in room ${roomId}`);

          // Clean up: remove both users from the waiting list (Redis)
          await deleteUser(socket.id);
          await deleteUser(match);
        } else {
          // In case the interests do not match (should not happen if the matching function works)
          socket.emit('waiting-for-match', { message: 'Waiting for someone with the same interest...' });
        }
      } else {
        // No matching user found yet – notify the user to wait
        socket.emit('waiting-for-match', { message: 'Waiting for someone with the same interest...' });
      }
    } catch (error) {
      console.error('Error in startChat event:', error);
      socket.emit('error', { message: 'Error finding a match. Please try again.' });
    }
  });

  // Cleanup on disconnect: remove the user from Redis
  socket.on('disconnect', async () => {
    console.log('User disconnected:', socket.id);
    try {
      await deleteUser(socket.id);
      console.log(`User ${socket.id} deleted successfully.`);
    } catch (error) {
      console.error('Error deleting user on disconnect:', error);
    }
  });
  // Additional socket event handling
  handelSocketConnection(io, socket);
});

// Start the server on port 4000 (redundant listen removed as it's already started above)
httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

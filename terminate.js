import mongoose from "mongoose";
import redisClient from "./src/database/redis.database.js";

export function terminate(server) {
  console.info("SIGTERM signal received.");

  server.close(() => {
    console.log("HTTP server closed.");

    redisClient.quit();

    mongoose.connection.close();
  });
}

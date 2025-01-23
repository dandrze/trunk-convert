import "dotenv/config";
import express from "express";
import passport from "passport";

import { connectDB } from "./src/database/mongo.database.js";
import conversionRoutes from "./src/routes/conversion.route.js";
import swaggerService from "./src/services/swagger.service.js";
import userRoutes from "./src/routes/user.route.js";
import { limitRequests } from "./src/middleware/requestLimiter.js";
import { terminate } from "./terminate.js";

import "./src/services/passport.service.js";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

// Swagger api documentation
app.use("/api-docs", swaggerService);

// the /demo-user route below is only for demo purposes and not set up for production use
app.use("/api/demo-user", userRoutes);

// all the routes below are protected by the bearer token and require a user
// passport logic located in /services/passport.service.js
app.use(passport.authenticate("bearer", { session: false }));

// The middleware checks the number of requests a user has made in a day and compares it to the request limit set in the environment variables.
// If the user has exceeded the request limit, a 429 status code is returned with a message indicating that the request limit has been exceeded.
app.use(limitRequests);

// the core of this app functionality is found in the route below
// v1 was added to the path to allow for future versions of the API
app.use("/api/v1/conversion", conversionRoutes);

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({ message: "Route Not Found" });
});

const server = app.listen(PORT, () => {
  // Connects to mongoDB using mongoose
  connectDB();
  console.log(`Server started on port ${PORT}`);
});

// Gracefully shutdown server and close connections
process.on("SIGTERM", () => terminate(server));
process.on("SIGINT", () => terminate(server));

export default app;

import express from "express";
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";

const router = express.Router();

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Trunk Conversion",
      description: "A simple API to convert currencies",
      version: "1.0.0",
      contact: {
        name: "David Andrzejewski",
        email: "andrzejewski.d@gmail.com",
      },
    },
    servers: [
      {
        url: "http://localhost:5000",
        description: "Development server",
      },
    ],
  },
  apis: ["./src/routes/*.js"],
};
router.use("/", swaggerUi.serve);
router.get("/", swaggerUi.setup(swaggerJsdoc(options)));

export default router;

import express from "express";
import { createUser } from "../controllers/user.controller.js";

const router = express.Router();

/**
 * @swagger
 * /api/demo-user:
 *  post:
 *   summary: Not actually used in the API, but creates a user for demo purposes
 *   responses:
 *     201:
 *       description: User created successfully
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               message:
 *                 type: string
 *                 description: The success message
 *                 example: User created successfully
 *               apiKey:
 *                 type: string
 *                 description: The api key to use as a bearer token in the API requests
 *                 example: 4e637fde-2362-4c1f-912f-0c488b3ec623
 *     400:
 *       description: Bad request
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               message:
 *                 type: string
 *                 description: The error message
 *                 example: "Server error"
 */
router.post("/", createUser);

export default router;

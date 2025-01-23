import express from "express";
import { getConversion } from "../controllers/conversion.controller.js";

const router = express.Router();

/**
 * @swagger
 * /api/v1/conversion:
 *  get:
 *   summary: Convert one currency to another
 *   parameters:
 *     - in: query
 *       name: from
 *       schema:
 *         type: string
 *       required: true
 *       description: Currency code to convert from
 *       example: USD
 *     - in: query
 *       name: to
 *       schema:
 *         type: string
 *       required: true
 *       description: Currency code to convert to
 *       example: EUR
 *     - in: query
 *       name: amount
 *       schema:
 *         type: number
 *       required: true
 *       description: Amount to convert
 *       example: 100.00
 *   responses:
 *     200:
 *       description: Conversion successful
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               from:
 *                 type: string
 *                 description: The currency code to convert from
 *                 example: USD
 *               to:
 *                 type: string
 *                 description: The currency code to convert to
 *                 example: EUR
 *               amount:
 *                 type: number
 *                 description: The amount to convert
 *                 example: 100
 *               convertedAmount:
 *                 type: number
 *                 description: The amount after conversion
 *                 example: 85.5
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
 *                 example: "'amount' query parameter must be a number"
 */
router.get("/", getConversion);

export default router;

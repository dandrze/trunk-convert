import { v4 as uuidv4 } from "uuid";
import User from "../models/user.model.js";

export const createUser = async (req, res) => {
  const apiKey = uuidv4();
  const user = new User({ apiKey });

  try {
    await user.save();
    res.status(201).json({
      message: "User created successfully",
      apiKey: user.apiKey,
    });
  } catch (error) {
    res.status(500).send(error.message);
  }
};

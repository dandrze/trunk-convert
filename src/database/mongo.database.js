import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    if (conn?.connection?.host)
      console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (e) {
    console.log(`Error: ${e.message}`);
  }
};

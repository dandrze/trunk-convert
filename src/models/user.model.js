import mongoose from "mongoose";

const { Schema } = mongoose;

const userSchema = new Schema({
  apiKey: {
    type: String,
    required: true,
  },
});

const User = mongoose.model("user", userSchema);

export default User;

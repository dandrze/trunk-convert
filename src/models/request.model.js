import mongoose from "mongoose";

const { Schema } = mongoose;

const requestSchema = new Schema(
  {
    params: {
      type: Object,
    },
    body: {
      type: Object,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "user",
    },
    // apiVersion could be useful if new versions of the api affect the body response, or introduce new params
    apiVersion: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const Request = mongoose.model("request", requestSchema);

export default Request;

import mongoose, { Schema, model } from "mongoose";

const messageSchema = new Schema({
    from: { type: mongoose.Schema.Types.ObjectId, ref: 'User'}, // User 스키마 참조
    to: { type: mongoose.Schema.Types.ObjectId, ref: 'User'},   // User 스키마 참조
    message: String,
    timestamp: { type: Date, default: Date.now },
  });

export default model("Message", messageSchema, "message");
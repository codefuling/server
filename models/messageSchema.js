import mongoose, { Schema, model } from "mongoose";

const messageSchema = new Schema({
    from: { type: mongoose.Schema.Types.ObjectId, ref: 'User'}, // User 스키마 참조
    to: { type: mongoose.Schema.Types.ObjectId, ref: 'User'},   // User 스키마 참조
    message: { type: String, required: true },
    chatRoom: { type: String }, // 그룹채팅인지 1:1채팅인지의 구분점
    timestamp: { type: Date, default: Date.now },
  });

export default model("Message", messageSchema, "message");
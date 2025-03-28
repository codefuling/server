import mongoose, { Schema, model } from "mongoose";
import { getCurrentTime } from "../utils/utils.js";

const userSchema = new Schema({
    email: { type: String, required : true, unique : true },
    password: { type: String },
    name: { type: String },
    age: { type : Number, default : 0 },
    phone: { type : String, default : "000-0000-0000"},
    picture: { type: String, default : "none_picture.jpg" },
    picturePath: { type: String, default : "default" },
    address: { type: String },
    token: { type: String }, // refresh 토큰을 저장한다.
    createdAt: { type: String, default: getCurrentTime },
    updatedAt: { type: String, default: getCurrentTime },
    provider: { type: String, default : "local" },
});

// model("객체명", 스키마, "컬렉션(테이블)명");
export default model("User", userSchema, "user");
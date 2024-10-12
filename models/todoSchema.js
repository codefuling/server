import { Schema, model } from "mongoose";
import { ObjectId } from "mongodb";
import { getCurrentTime } from "../utils/utils.js";

const todoSchema = new Schema({
    title: { type: String, require: true },
    content:{ type: String },
    isChecked : { type: Boolean, default: false },
    createdAt: { type: String, default: getCurrentTime },
    updatedAt: { type: String, default: getCurrentTime },
    user: { type: ObjectId, ref: "User", required: true },
});
// model("객체명", 스키마, "컬렉션(테이블)명");
export default model("Todo", todoSchema, "todo");
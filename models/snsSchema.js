import { Schema, model } from "mongoose";
import { getCurrentTime } from "../utils/utils.js";

const snsSchema = new Schema({
    snsId: { type: String, required : true },
    email: { type: String, required : true, unique : true },
    name: String,
    picture : String,
    provider : String,
    createdAt: { type: String, default: getCurrentTime },
    updatedAt: { type: String, default: getCurrentTime },
});

// model("객체명", 스키마, "컬렉션(테이블)명");
export default model("Sns", snsSchema, "Sns");
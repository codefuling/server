import { Schema, model } from "mongoose";
import { getCurrentTime } from "../utils/utils.js";

const productSchema = new Schema({
    name: { type: String, require: true },
    price: { type: Number, default: 0 },
    stock: { type: Number, default: 0 },
    createdAt: { type: String, default: getCurrentTime },
    updatedAt: { type: String, default: getCurrentTime },
});
// model("객체명", 스키마, "컬렉션(테이블)명");
export default model("Product", productSchema, "product");
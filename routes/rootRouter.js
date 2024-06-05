import express from "express";
import { index } from "../controller/index.js";
import productRouter from "./product/productRouter.js";

const rootRouter = express.Router();

rootRouter.get('/', index)
rootRouter.use('/product', productRouter)

export default rootRouter;
import express from "express";
import { index } from "../controller/index.js";
import productRouter from "./product/productRouter.js";
import todoRouter from "./todo/todoRouter.js";

const rootRouter = express.Router();

rootRouter.get('/', index)
rootRouter.use('/product', productRouter)
rootRouter.use('/todo', todoRouter)

export default rootRouter;
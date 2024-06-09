import express from "express";
import { index } from "../controller/index.js";
import productRouter from "./product/productRouter.js";
import todoRouter from "./todo/todoRouter.js";
import userRouter from "./user/userRouter.js";

const rootRouter = express.Router();

rootRouter.get('/', index)
rootRouter.use('/product', productRouter)
rootRouter.use('/todo', todoRouter)
rootRouter.use('/user', userRouter)
 
  

export default rootRouter;
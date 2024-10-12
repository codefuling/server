import express from "express";
import { insertProduct, sortProduct, readProduct, modifyProduct, removeProduct } from "../../controller/product/product.js";
const productRouter = express.Router();

// product
productRouter.post("/insert", insertProduct);
productRouter.get("/sort", sortProduct);
productRouter.get("/read", readProduct)
productRouter.put("/modify", modifyProduct)
productRouter.delete("/delete", removeProduct)

export default productRouter;

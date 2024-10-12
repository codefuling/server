import Product from "../../models/productSchema.js";
import { getCurrentTime } from "../../utils/utils.js";

// PostMan Test
// POST   127.0.0.1:8000/products/register
// Body(JSON):
// {
//     "name": "마우스",
//     "price": 54000,
//     "stock": 80
// }
const insertProduct = async (req, res) => {
    const product = {
        name: req.body.name,
        price: req.body.price,
        stock: req.body.stock,
    };

    await Product.create(product);
    res.send("success");
};

// PostMan Test
// GET   127.0.0.1:8000/products/list
const sortProduct = async (req, res) => {
    res.json(await Product.find().sort({ _id: -1 }));
    // res.json(await Product.find().sort("-_id"));
};

// PostMan Test
// GET  127.0.0.1:8000/products/read?&id=65ee94d397948863ae354e58
const readProduct = async (req, res) => {

    // 쿼리스트링으로 보낼 경우
    console.log(req.query.id)
    res.json(await Product.findOne({ _id: req.query.id }));

    // post 요청으로 보낼 경우
    res.json(await Product.findOne({ _id: req.body.id }));

};

// PostMan Test
// PATCH    127.0.0.1:8000/products/modify
// {
//     "id": "65ee94d397948863ae354e58",
//     "name": "선물",
//     "price": 98000,
//     "stock": 777
// }
const modifyProduct = async (req, res) => {
    const product = {
        name: req.body.name,
        price: req.body.price,
        stock: req.body.stock,
        updatedAt: getCurrentTime(),
    };
    await Product.updateOne({ _id: req.body.id }, product);
    res.send("success");
};

// PostMan Test
// DELETE   127.0.0.1:8000/products/remove
// Body(JSON): {"id": "65ee94d397948863ae354e58"}
const removeProduct = async (req, res) => {
    await Product.deleteOne({ _id: req.body.id });
    res.send("success");
};

export { insertProduct, sortProduct, readProduct, modifyProduct, removeProduct };

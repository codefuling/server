import express from "express";
import { deleteTodo, insertTodo, modifyTodo, selectTodo, testTodo } from "../../controller/todo/todo.js";

const todoRouter = express.Router();

todoRouter.post("/test", testTodo);
todoRouter.get("/select", selectTodo);
todoRouter.post("/insert", insertTodo);
todoRouter.put("/modify", modifyTodo)
todoRouter.delete("/delete", deleteTodo)

export default todoRouter;

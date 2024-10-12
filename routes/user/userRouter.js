import express from "express";
import { loginUser, registerUser, updateUser, deleteUser } from "../../controller/user/user.js";

const userRouter = express.Router();

userRouter.post("/login", loginUser);
userRouter.post("/register", registerUser);
userRouter.put("/update", updateUser)
userRouter.delete("/delete", deleteUser)

export default userRouter;

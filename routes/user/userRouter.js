import express from "express";
import passport from "passport";
import { loginUser, registerUser, updateUser, deleteUser, passportLogin, authLocation } from "../../controller/user/user.js";

const userRouter = express.Router();

userRouter.post("/login", loginUser);
userRouter.post("/register", registerUser);
userRouter.put("/update", updateUser)
userRouter.delete("/delete", deleteUser)

// passport 추가
// passport 라우팅
userRouter.post("/passportLogin", passportLogin)

// 추가로 인증 후 접근해야하는 fetch주소 마다 authenticateLocal()을 심는다
userRouter.post("/auth", passport.authenticate('jwt', { session: false }), authLocation )

export default userRouter;

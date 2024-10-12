import express from "express";
import passport from "passport";
import { googleStrategy, jwtStrategy, kakaoStrategy, localStrategy, naverStrategy } from "../../controller/auth/auth.js";

const authRouter = express.Router();
const clientUrl = "http://localhost:3000";

// auth
// passport 추가
// passport 라우팅
authRouter.post("/local", passport.authenticate('local', { session: false }), localStrategy)

// 추가로 인증 후 접근해야하는 fetch주소 마다 authenticateLocal()을 심는다
authRouter.post("/jwt", passport.authenticate('jwt', { session: false }), jwtStrategy)

// 구글 로그인
authRouter.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }), googleStrategy);
authRouter.get('/google/callback', passport.authenticate('google', { failureRedirect: clientUrl }), (req, res) => {
    console.log("구글 로그인 후 유저 정보", req.user)
    return res.redirect(clientUrl + "/my");
});

// 카카오 로그인
authRouter.get("/kakao", passport.authenticate('kakao', { session: false }), kakaoStrategy)
authRouter.get('/kakao/callback', passport.authenticate('kakao', { failureRedirect: clientUrl }), (req, res) => {
    console.log("카카오 로그인 후 유저 정보", req.user)
    return res.redirect(clientUrl + "/my");
});

// 네이버 로그인
// 카카오 로그인
authRouter.get("/naver", passport.authenticate('naver', { authType: 'reprompt' }), naverStrategy)
authRouter.get('/naver/callback', passport.authenticate('naver', { failureRedirect: clientUrl }), (req, res) => {
    console.log("네이버 로그인 후 유저 정보", req.user)
    return res.redirect(clientUrl + "/my");
});


// sns로그인 후 session에 사용자가 존재할 때
authRouter.get('/profile', (req, res) => {
    console.log(req.isAuthenticated())
    if (!req.isAuthenticated()) {
        return res.redirect('/');
    }
    
    // 로그인한 사용자의 정보를 전달
    const {email, name} = req.user;
    res.status(200).json({
        user : {
            email,
            name
        }, 
        loginSuccess : true, // 상태 발급
        message : "로그인 되었습니다." // 메세지
    })
});

// 로그아웃 처리
authRouter.get('/logout', (req, res) => {
    req.logout((err) => {
        if (err) { return next(err); }
        res.redirect(clientUrl);
    });
});

export default authRouter;

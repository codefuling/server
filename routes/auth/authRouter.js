import express from "express";
import passport from "passport";
import { jwtStrategy, localStrategy } from "../../controller/auth/auth.js";

const authRouter = express.Router();
const clientUrl = "http://localhost:3000";

// passport 라우팅
authRouter.post("/local", passport.authenticate('local', { session: false }), localStrategy)

// 추가로 인증 후 접근해야하는 fetch주소 마다 authenticateLocal()을 심는다
authRouter.post("/jwt", passport.authenticate('jwt', { session: false }), jwtStrategy)

// 구글 로그인
authRouter.get('/google', passport.authenticate('google', { 
    session: false, 
    scope: ['profile', 'email'] 
}));

authRouter.get('/google/callback', passport.authenticate('google', { session: false, failureRedirect: clientUrl }), (req, res) => {
    console.log("구글 로그인 후 유저 정보", req.user)
    const accessToken = req.user.accessToken;
    return res.redirect(`${clientUrl}/my?accessToken=${accessToken}`);
});

// 카카오 로그인
authRouter.get("/kakao", passport.authenticate('kakao', { session: false }))
authRouter.get('/kakao/callback', passport.authenticate('kakao', { failureRedirect: clientUrl }), (req, res) => {
    console.log("카카오 로그인 후 유저 정보", req.user)
    const accessToken = req.user.accessToken;
    return res.redirect(`${clientUrl}/my?accessToken=${accessToken}`);
});

// 네이버 로그인
authRouter.get("/naver", passport.authenticate('naver', { session: false, authType: 'reprompt' }))
authRouter.get('/naver/callback', passport.authenticate('naver', { failureRedirect: clientUrl }), (req, res) => {
    console.log("네이버 로그인 후 유저 정보", req.user)
    const accessToken = req.user.accessToken;
    return res.redirect(`${clientUrl}/my?accessToken=${accessToken}`);
});


// 로그아웃 처리
authRouter.get('/logout', (req, res) => {
    req.logout((err) => {
        if (err) {
          return res.status(500).send('로그아웃 실패');
        }
        // 세션 삭제
        req.session.destroy((err) => {
          if (err) {
            return res.status(500).send('세션 삭제 실패');
          }
          // 로그아웃 성공 시 클라이언트에 성공 메시지 전송
          res.clearCookie('connect.sid', { path: '/' });
          res.status(200).send('로그아웃 성공');
        });
      });
});

export default authRouter;

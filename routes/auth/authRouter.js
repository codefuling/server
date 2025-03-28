import express from "express";
import passport from "passport";
import { jwtStrategy, localStrategy } from "../../controller/auth/auth.js";
import User from "../../models/userSchema.js";

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
    const accessToken = req.user.accessToken;

    // 세션에 정보 전달
    req.session.email = req.user.email;
    req.session.accessToken =  req.user.accessToken;
    req.session.provider = "google";

    // 이미 다른 소셜
    if(req.user.provider !== 'google') {
      return res.redirect(`${clientUrl}/signIn?message=이미 다른 소셜 계정으로 가입된 유저입니다. ${req.user.provider}`);
    }
    return res.redirect(`${clientUrl}/my?accessToken=${accessToken}`);
});

// 카카오 로그인
authRouter.get("/kakao", passport.authenticate('kakao', { session: false }))
authRouter.get('/kakao/callback', passport.authenticate('kakao', { failureRedirect: clientUrl }), (req, res) => {
    const accessToken = req.user.accessToken;
    return res.redirect(`${clientUrl}/my?accessToken=${accessToken}`);
});

// 네이버 로그인
authRouter.get("/naver", passport.authenticate('naver', { session: false, authType: 'reprompt' }))
authRouter.get('/naver/callback', passport.authenticate('naver', { failureRedirect: clientUrl }), (req, res) => {
    const accessToken = req.user.accessToken;
    return res.redirect(`${clientUrl}/my?accessToken=${accessToken}`);
});

// 소셜 로그인 통합하기
authRouter.get('/integrate', async (req, res) => {
  const {email, accessToken, provider} = req.session;
  
  const foundUser = await User.findOne({ email : email }).lean()
  if (foundUser) {

    // 이미지 업데이트
    // 만약 프로필 사진이 있다면 기존에 프로필사진
    // 없다면 로컬의 기존 사진 사용

    await User.updateOne(
        { email: email },  
        { provider: provider } 
    );
  }
  return res.status(200).json({
    message : `${provider} 소셜 계정으로 통합되었습니다.`,
    accessToken : accessToken
  });
})

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

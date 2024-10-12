// passport 준비
import jwt from "jsonwebtoken";
import dotenv from 'dotenv'
import passport from "passport";
dotenv.config();
const SECRET_KEY = process.env.SECRET_KEY;

const localStrategy = async (req, res, next) => {
    try {   
            const error = req.error;
            const authenticatedUser = req.user;
            const info = req.info;
            
            // 인증이 실패했거나 유저 데이터가 없다면 에러 발생
            if (error || !authenticatedUser) {
                res.status(400).json({ message: info.message });
                return;
            }
            // user데이터를 통해 로그인 진행
            req.login(authenticatedUser, { session: false }, async (loginError) => {
                if (loginError) {
                    return res.send(loginError);
                }
            // 클라이언트에게 JWT생성 후 반환
                const token = jwt.sign(
                    { 
                        email: authenticatedUser.email, 
                        issuer : 'sehwan' 
                    },
                    SECRET_KEY,
                    {
                        expiresIn: '24h'    // 유효 시간 24시간 평균적으로 5분
                    }
                );
                
                console.log('authenticatedUser', authenticatedUser);

                // user의 민감한 정보 제거
                const {password, ...user} = authenticatedUser;
            // 토큰과 회원정보 반환
                res.status(200).json({
                    user, 
                    token,
                })
            });

    } catch (error) {
        console.error(error);
        next(error);
    }
};

// 토큰을 이용해서 인증 받는 라우팅
const jwtStrategy = async (req, res, next) => {
    try {
    // 인가가 완료된 유저 정보는 req.user에 담긴다.
      const jwtAuthenticatedUser = req.user;
      const {password, ...user} = jwtAuthenticatedUser;
            res.json({ 
                message : '자동 로그인 성공',
                user
            });
    } catch (error) {
      console.error(error);
      next(error);
    }
};


// 구글을 이용해서 인증받는 라우팅
const googleStrategy = async (req, res, next) => {
    try {
    // 인가가 완료된 유저 정보는 req.user에 담긴다.
        const googleAuthenticatedUser = req.user;
        console.log(googleAuthenticatedUser)

    } catch (error) {
        console.error(error);
        next(error);
    }
}



// 카카오를 이용해서 인증받는 라우팅
const kakaoStrategy = async (req, res, next) => {
    try {
    // 인가가 완료된 유저 정보는 req.user에 담긴다.
        const kakaoAuthenticatedUser = req.user;
        console.log(kakaoAuthenticatedUser)

    } catch (error) {
        console.error(error);
        next(error);
    }
}


// 네이버를 이용해서 인증받는 라우팅
const naverStrategy = async (req, res, next) => {
    try {
    // 인가가 완료된 유저 정보는 req.user에 담긴다.
        const naverAuthenticatedUser = req.user;
        console.log(naverAuthenticatedUser)

    } catch (error) {
        console.error(error);
        next(error);
    }
}


export { localStrategy, jwtStrategy, googleStrategy, kakaoStrategy, naverStrategy}
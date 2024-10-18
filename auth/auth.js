import passport from 'passport';
import { Strategy as JWTStrategy, ExtractJwt } from 'passport-jwt';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as KakaoStrategy } from 'passport-kakao';
import { Strategy as NaverStrategy } from 'passport-naver-v2';

import User from "../models/userSchema.js";
import Sns from "../models/snsSchema.js";
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';

dotenv.config();
const SECRET_KEY = process.env.SECRET_KEY;

// passport 인증기능 설정
// username, password로 약속된 필드 이름을 변경
const passportConfig = { 
  usernameField: 'email', passwordField: 'password' 
};

const passportVerify = async (email, password, done) => {
  try {
    // 유저 아이디로 일치하는 유저 데이터 검색
    const user = await User.findOne({ email: email }).lean();
    // 검색된 유저 데이터가 없다면 에러 표시
    if (!user) {
      console.log("로직실행")
      return done(null, false, { message: '존재하지 않는 사용자입니다.' });
    }

    // 유저 해쉬된 비밀번호 비교
    const plainPassword = password;
    const hashedPassword = user.password;

    bcrypt.compare(plainPassword, hashedPassword, (err, result) => {
      if (err) {
        // bcrypt 오류 발생 시 처리
        return done(err); // bcrypt 에러가 있으면 done으로 전달
      } 
      
      if (result) {
        // 로그인 성공
        return done(null, user);
      } else {
        // 비밀번호가 틀렸을 경우
        return done(null, false, { message: '올바르지 않은 비밀번호입니다.' });
      }
    });

  } catch (error) {
    console.error(error);
    return done(error); // 내부 오류 발생 시 에러 전달
  }
};


// jwt 검증 로직
// header에 토큰을 심어 이후 요청에 확인한다.
const JWTConfig = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: SECRET_KEY,
};

// 그리고 JWT토큰을 읽기 위해 다음 설정을 추가한다
const JWTVerify = async (jwtPayload, done) => {
  try {
		// payload의 id값으로 유저의 데이터 조회
    const email = jwtPayload.email;
    const user = await User.findOne({ email : email }).lean();
		
    // 유저 데이터가 없을 경우 에러 표시
    if (!user) {
      done(null, false, { reason: '올바르지 않은 인증정보 입니다.' });
    }
    // 유저 데이터가 있다면 유저 데이터 객체 전송
    return done(null, user);
    
  } catch (error) {
    console.error(error);
    done(error);
  }
};


const googleConfig = {
  clientID: process.env.GOOGLE_ID, // 구글 로그인에서 발급받은 REST API 키
  clientSecret: process.env.GOOGLE_SECRET,
  callbackURL: '/auth/google/callback', // 구글 로그인 Redirect URI 경로
};

const googleVerify =  async (accessToken, refreshToken, profile, done) => {
  console.log('google profile : ', profile);
  const { id, emails, displayName, picture, provider } = profile;
  try {
    // 구글 플랫폼에서 로그인 했고 & snsId필드에 구글 아이디가 일치할경우
     const exUser = await User.findOne({ email : emails[0].value }).populate({
        path: 'snsId', // 연관 컬럼
        match: { 
          email: emails[0].value,
          provider: 'google'
        }
      }).lean();

      console.log("exUser", exUser)

     // 이미 가입된 구글 프로필이면 성공
     if (exUser) {
        done(null, exUser); // 로그인 인증 완료
     } else {
      const createdSnsUser = await Sns.create({
        snsId: id,
        email: emails[0].value,
        name: displayName,
        picture: picture,
        provider: provider
      });
    
      // Sns에서 새로 생성한 사용자 정보를 가져옴
      const newUser = await User.create({
        email: createdSnsUser.email,
        snsId: createdSnsUser._id, // Sns 스키마의 ID 사용
      });
    
      done(null, newUser); 
     }
  } catch (error) {
     console.error(error);
     done(error);
  }
};

const kakaoConfig = {
  clientID: process.env.KAKAO_REST_API, // 카카오에서 발급받은 REST API 키
  callbackURL: '/auth/kakao/callback', // 카카오에 적은 Redirect URI 경로
};

const kakaoVerify =  async (accessToken, refreshToken, profile, done) => {
  console.log('kakao profile : ', profile);
};

// 네이버 
const naverConfig = {
  clientID: process.env.NAVER_ID,
  clientSecret: process.env.NAVER_SECRET,
  callbackURL: '/auth/naver/callback',
};

const naverVerify =  async (accessToken, refreshToken, profile, done) => {
  console.log('naver profile : ', profile);
  const { id, email, nickname, profileImage, provider } = profile;
  try {
    // 네이버 플랫폼에서 로그인 했고 & snsId필드에 구글 아이디가 일치할경우
     const exUser = await User.findOne({ email : email }).populate({
        path: 'snsId', // 연관 컬럼
        match: { 
          email: email,
          provider: 'naver'
        }
      }).lean();

     // 이미 가입된 네이버 프로필이면 성공
     if (exUser) {
        done(null, exUser); // 로그인 인증 완료
     } else {

      // 아니라면 가입
      const createdSnsUser = await Sns.create({
        snsId: id,
        email: email,
        name: nickname,
        picture: profileImage,
        provider: provider
      });
    
      // Sns에서 새로 생성한 사용자 정보를 가져옴
      const newUser = await User.create({
        email: createdSnsUser.email,
        snsId: createdSnsUser._id, // Sns 스키마의 ID 사용
      });
    
      done(null, newUser); 
     }
  } catch (error) {
     console.error(error);
     done(error);
  }
};

const initializePassport = () => {
  passport.use('local', new LocalStrategy(passportConfig, passportVerify));
  passport.use('jwt', new JWTStrategy(JWTConfig, JWTVerify));
  passport.use('google', new GoogleStrategy(googleConfig, googleVerify))
  passport.use('kakao', new KakaoStrategy(kakaoConfig, kakaoVerify));
  passport.use('naver', new NaverStrategy(naverConfig, naverVerify));
};

export { initializePassport }
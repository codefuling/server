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
    // .lean() : 데이터를 자바스크립트 객체로 변환
    const user = await User.findOne({ email: email }).lean();
		// 검색된 유저 데이터가 없다면 에러 표시
    if (!user) {
      return done(null, false, { message: '존재하지 않는 사용자입니다.' });
    }
		// 검색된 유저 데이터가 있다면 유저 해쉬된 비밀번호 비교 
    const passwordMatch = password === user.password;

		// 비밀번호가 다를경우 에러 표시
    if (!passwordMatch) {
      return done(null, false, { message: '올바르지 않은 비밀번호입니다.' });
    }
    // 비밀번호가 같다면 유저 데이터 객체 전송
    return done(null, user);
  
  } catch (error) {
    console.error(error);
    done(error);
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
    const user = await User.findOne({ email : jwtPayload.email } ).lean();
		
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
  try {
    // 구글 플랫폼에서 로그인 했고 & snsId필드에 구글 아이디가 일치할경우
     const exUser = await Sns.findOne({ snsId: profile.id, provider: 'google'}).lean();

     // 이미 가입된 구글 프로필이면 성공
     if (exUser) {
        done(null, exUser); // 로그인 인증 완료
     } else {
        // 가입되지 않는 유저면 회원가입 시키고 로그인을 시킨다
        await Sns.create({
          snsId : profile.id,
          email : profile?.emails[0].value,
          name : profile.displayName,
          picture : profile.picture,
          provider : profile.provider
        })

        const newUser = await Sns.findOne({ snsId: profile.id, provider: 'google'}).lean();
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
  try {
    // 카카오 플랫폼에서 로그인 했고 & snsId필드에 카카오 아이디가 일치할경우
    const exUser = await Sns.findOne({ snsId: profile.id, provider: 'kakao'}).lean();

     // 이미 가입된 구글 프로필이면 성공
     if (exUser) {
        done(null, exUser); // 로그인 인증 완료
     } else {
        // 가입되지 않는 유저면 회원가입 시키고 로그인을 시킨다

        await Sns.create({
          snsId : profile.id,
          email : "test@test.com",
          name : profile.displayName,
          picture : profile._json.properties.profile_image,
          provider : "kakao"
        })

        const newUser = await Sns.findOne({ snsId: profile.id, provider: 'kakao'}).lean();
        done(null, newUser); 
     }
  } catch (error) {
     console.error(error);
     done(error);
  }
};



// 네이버 
const naverConfig = {
  clientID: process.env.NAVER_ID,
  clientSecret: process.env.NAVER_SECRET,
  callbackURL: '/auth/naver/callback',
};

const naverVerify =  async (accessToken, refreshToken, profile, done) => {
  console.log('naver profile : ', profile);
  try {
    // 카카오 플랫폼에서 로그인 했고 & snsId필드에 카카오 아이디가 일치할경우
    // const exUser = await Sns.findOne({ snsId: profile.id, provider: 'kakao'}).lean();
    const exUser = {};

     // 이미 가입된 구글 프로필이면 성공
     if (exUser) {
        done(null, exUser); // 로그인 인증 완료
     } else {
        // 가입되지 않는 유저면 회원가입 시키고 로그인을 시킨다

        // await Sns.create({
        //   snsId : profile.id,
        //   email : "test@test.com",
        //   name : profile.displayName,
        //   picture : profile._json.properties.profile_image,
        //   provider : "kakao"
        // })

        // const newUser = await Sns.findOne({ snsId: profile.id, provider: 'kakao'}).lean();
        const newUser = {};
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
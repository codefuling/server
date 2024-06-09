import passport from 'passport';
import { Strategy as JWTStrategy, ExtractJwt } from 'passport-jwt';
import { Strategy as LocalStrategy } from 'passport-local';
import jwt from 'jsonwebtoken';
import User from "../models/userSchema.js";
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
    const user = await User.findOne({ email: email });
		// 검색된 유저 데이터가 없다면 에러 표시
    if (!user) {
      done(null, false, { reason: '존재하지 않는 사용자 입니다.' });
      return;
    }
		// 검색된 유저 데이터가 있다면 유저 해쉬된 비밀번호 비교 
    const passwordMatch = password === user.password;

		// 비밀번호가 다를경우 에러 표시
    if (!passwordMatch) {
      done(null, false, { reason: '올바르지 않은 비밀번호 입니다.' });
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
    const user = await User.findOne({ email : jwtPayload.email } );
		
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

// local 사용하여 검증
const initializePassport = () => {
  passport.use('local', new LocalStrategy(passportConfig, passportVerify));
  passport.use('jwt', new JWTStrategy(JWTConfig, JWTVerify));
};

export { initializePassport }
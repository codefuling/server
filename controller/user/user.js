import { getCurrentTime } from "../../utils/utils.js";
import User from "../../models/userSchema.js"; 

// passport 준비
import passport from 'passport';
import jwt from "jsonwebtoken";
import dotenv from 'dotenv'
dotenv.config();
const SECRET_KEY = process.env.SECRET_KEY;


// user 
const loginUser = async (req, res) => {
    // 회원을 찾는다
    const user = await User.findOne({email : req.body.email})
    // 만약 유저가 없다면
    if(!user){
        // 사용자가 잘못된 인증 요청한 경우 401 코드
        return res.status(401).json({
            registerSuccess : false,
            message : "존재하지 않는 이메일입니다."
        })
        
    }else{
        const passwordMatch = req.body.password === user.password;
          if(!passwordMatch){
            return res.status(401).json({
                registerSuccess : false,
                message : "비밀번호를 확인해 주세요."
            })
        }

        //민감한 정보 제거, 필요한 정보만 담는다
        const { ...userDatas } = user;
        const { password, ...others } = userDatas._doc;
        console.log(others)

        // 비밀번호를 제외한 나머지 정보만 화면으로 보낸다. 
        return res.status(200).json({
            user: others, // 최초 로그인
            registerSuccess : true, // 상태 발급
            message : "로그인 되었습니다." // 메세지
        })
    }
}

const registerUser = async (req, res) => {
    // 등록 전에 회원인지 확인한다.
    let user = await User.findOne({email : req.body.email})
    // 만약 유저가 있다면, 회원가입을 할 수 없다.
    if(user){
        // 중복 회원가입 요청이 발생했을 때 409 코드
        return res.status(409).json({
            registerSuccess : false,
            message : "이미 존재하는 이메일 입니다."
        })
    }else{
        // 유저를 등록
        let regiseter = {
            email : req.body.email,
            password : req.body.password
        }
        await User.create(regiseter)
        // 리소스의 생성을 성공적으로 완료 201 코드
        return res.status(201).json({
            registerSuccess : true,
            message : "축하합니다. 회원가입이 완료 되었습니다."
        })
    }
};

const selectUser = async (req, res) => {
    // password 정보를 안보이게 막아야한다. 디스트럭팅을 통해서 나머지 데이터만 전달
    const {password, ...others} = userData; 
    res.status(200).json(others);
}

const updateUser = async (req, res) => {

};

const deleteUser = async (req, res) => {
    const user = await User.findOne({ email: req.body.email });
    const userDeleted = await User.deleteOne(user);
    console.log(userDeleted)

};


const passportLogin = async (req, res, next) => {
    try {
		// 아까 local로 등록한 인증과정 실행
        passport.authenticate('local', (error, user, info) => {
        // 인증이 실패했거나 유저 데이터가 없다면 에러 발생
        if (error || !user) {
            res.status(400).json({ message: info.reason });
            return;
        }
        // user데이터를 통해 로그인 진행
        req.login(user, { session: false }, async (loginError) => {
            if (loginError) {
            res.send(loginError);
            return;
            }
            // 클라이언트에게 JWT생성 후 반환
            const token = jwt.sign(
                { 
                    email: user.email, 
                    issuer : 'sehwan' 
                },
                SECRET_KEY,
                {
                    expiresIn: '24h'    // 유효 시간 24시간 평균적으로 5분
                }
            );
            
            // 유저와 토큰을 발급
            const loginUser = await User.findOne({ email: user.email });
            console.log(loginUser)
            // 민감한 정보 제거
            // 최초 유저정보 전달
            const {password ,...others} = loginUser;
            res.json({ 
                ...others._doc,
                token: token 
            });

        });
        })(req, res, next);
    } catch (error) {
        console.error(error);
        next(error);
    }
};

// 토큰을 이용해서 인증 받는 라우팅
const authLocation = async (req, res, next) => {
    try {
    // 인가가 완료된 유저 정보는 req.user에 담긴다.
      console.log(authLocation, req.user)
      const {password ,...others} = req.user;
            res.json({ 
            message : '자동 로그인 성공',
            ...others._doc,
            });
    } catch (error) {
      console.error(error);
      next(error);
    }
};

export { 
    loginUser, registerUser, updateUser, deleteUser,  passportLogin, authLocation
};

import path from "path";
import User from "../../models/userSchema.js"; 
import bcrypt from 'bcrypt';

// user 
const loginUser = async (req, res) => {
    // 회원을 찾는다
    // .lean() 메서드로 자바스크립트 객체로 변환한다.
    const findUser = await User.findOne({email : req.body.email}).lean();
    // 만약 유저가 없다면
    if(!findUser){
        // 사용자가 잘못된 인증 요청한 경우 401 코드
        return res.status(401).json({
            loginSuccess : false,
            message : "존재하지 않는 이메일입니다."
        })
        
    }else{

        const plainPassword = req.body.password;
        const hashedPassword = findUser.password;

        bcrypt.compare(plainPassword, hashedPassword, (err, result) => {
            if (err) {
                console.error(err);
            } else if (result) {
                console.log('비밀번호 일치!');
                // 로그인 처리
                
                //민감한 정보 제거, 로그인 처리
                const { password, ...user } = findUser;
                console.log(user)

                // 비밀번호를 제외한 나머지 정보만 화면으로 보낸다. 
                return res.status(200).json({
                    user, // 최초 로그인
                    loginSuccess : true, // 상태 발급
                    message : "로그인 되었습니다." // 메세지
                })

            } else {
              // 로그인 실패 처리
                return res.status(401).json({
                    loginSuccess : false,
                    message : "비밀번호를 확인해 주세요."
                })
            }
          });

 
    }
}

const registerUser = async (req, res) => {
    // 등록 전에 회원인지 확인한다.
    const findUser = await User.findOne({email : req.body.email}).lean();
    // 만약 유저가 있다면, 회원가입을 할 수 없다.
    if(findUser){
        // 중복 회원가입 요청이 발생했을 때 409 코드
        return res.status(409).json({
            registerSuccess : false,
            message : "이미 존재하는 이메일 입니다."
        })
    }else{

        console.log("화면 비밀번호", req.body.password)
        // 비밀번호 해시화
        const saltRounds = 10;  // 해시 강도를 설정 (높을수록 더 안전하지만 느려짐)
        const plainPassword = req.body.password;

        bcrypt.hash(plainPassword, saltRounds, async (err, hash) => {
            if (err) {
                console.error(err);
            } else {
                // 유저를 등록
                console.log("해쉬 비밀번호" , plainPassword)
                let regiseter = {
                    email : req.body.email,
                    password : hash
                }
                await User.create(regiseter)
                // 리소스의 생성을 성공적으로 완료 201 코드
                return res.status(201).json({
                    registerSuccess : true,
                    message : "축하합니다. 회원가입이 완료 되었습니다."
                })
            }
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

// 프로필 변경 라우터
const updatePicture = async (req, res) => {
    const uploadFolder = "uploads/profiles";
    const relativePath = path.join(uploadFolder, req.file.filename).replace(/\\/g, '/');
    res.status(200).json({
        message : "업로드 완료",
        filePath: `/${relativePath}`
    });
}

export { 
    loginUser, registerUser, updateUser, deleteUser, updatePicture
};

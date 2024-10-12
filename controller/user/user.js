import User from "../../models/userSchema.js"; 

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
        const passwordMatch = req.body.password === findUser.password;
          if(!passwordMatch){
            return res.status(401).json({
                loginSuccess : false,
                message : "비밀번호를 확인해 주세요."
            })
        }

        //민감한 정보 제거, 필요한 정보만 담는다
        const { password, ...user } = findUser;
        console.log(user)

        // 비밀번호를 제외한 나머지 정보만 화면으로 보낸다. 
        return res.status(200).json({
            user, // 최초 로그인
            loginSuccess : true, // 상태 발급
            message : "로그인 되었습니다." // 메세지
        })
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

export { 
    loginUser, registerUser, updateUser, deleteUser
};

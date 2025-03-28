import jwt from 'jsonwebtoken';
import User from "../../models/userSchema.js";

const thumbnail = async (req, res) => {
  console.log("요청 들어옴!")
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }

   // JWT 토큰 추출
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).send('Authorization token is missing.');
  }

  const decoded = jwt.verify(token, process.env.SECRET_KEY);
  const currentUserEmail = decoded.email;

  const picturePath = req.file.path.replace(req.file.filename, "").replace(/\\$/, ''); //끝 슬래시 제거
  const picture = req.file.filename;

  // 전송 보내기전에 유저의 정보를 수정
  const foundUser = await User.findOne({ email: currentUserEmail }).lean();

  await User.updateOne(
    foundUser,
    {
      picturePath : picturePath,
      picture : picture
    }
  )

  res.status(200).json({
    message: 'File uploaded successfully',
    filePath: req.file.path,
    fileName: req.file.filename
  });
};

export { thumbnail };

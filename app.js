// 디렉토리 구조 및 순서
// 1. db: DBMS 연결 및 설정

// 2 ~ 6까지 반복
// 2. app.js(server.js): 서버 설정, 미들웨어 설정 및 라우터 설정
// 3. schemas: 스키마 정의
// 4. controllers: DB 접근 및 비지니스 로직 작성
// 5. routers: 요청한 경로에 맞는 controller를 실행하는 라우터 작성
// 6. utils: 중복되는 코드를 하나의 유틸 함수로 묶기
import express from "express";
import connect from "./connect/connect.js";

// yarn add cors
import cors from "cors";
// Express 4.16이상 버전부터는 body-parser가 내장되어 있다.
import bodyParser from "body-parser";
import rootRouter from "./routes/rootRouter.js";

// dotenv사용
// 다음과 같이 애플리케이션 기본 파일에서 최대한 빨리 가져온다.
import dotenv from 'dotenv';
dotenv.config()

// express 실행
const app = express();
const port = 8000;


// 이미지 등록
import multer from 'multer';
import fs from 'fs';
import path from "path";
import { fileURLToPath } from 'url';

// ES Modules에서 __dirname 설정
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


// passport
import passport from "passport";
import { initializePassport } from "./auth/auth.js"

// 구글 로그인시 세션 필요
import session from "express-session";

// 쪽지 기능
import { createRequire } from 'module';
import Message from "./models/messageSchema.js";
import User from "./models/userSchema.js";
const require = createRequire(import.meta.url); // ESM에서 require 사용 가능하게 만듦
const WebSocket = require('ws');

// MongoDB 연결
connect();

// app.use()는 미들웨어로서,
// 어떤 요청이든 지정된 로직보다 먼저 작업한다. 즉, 전처리이다.
app.use(bodyParser.json()); // request body가 JSON일 때
// app.use(bodyParser.urlencoded({ extended: false })); // request body가 form일 때

// CORS 전체 허용
// 테스트용 모두 허용하기
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin','*')
  next()
})

// extended true면 qs모듈을 사용하여 쿼리스트링으로 인식, false
app.use(express.urlencoded({extended : false}));
app.use(cors({
  origin : 'http://localhost:3000', // 테스트할 땐 * 카드 사용하고 배포할 때 변경
  method : ['GET', 'POST', 'DELETE', 'PUT'],
  credentials : true,
}));

// 구글 로그인 session 필요
app.use(session({ 
  secret : "SECRET_KEY",
  resave: false,
  saveUninitialized: true
}))


// 파일 이름 중복 처리 함수
const uploadFolder = "uploads/profiles";
const getUniqueFileName = (originalName, uploadFolder) => {
  const ext = path.extname(originalName); // 확장자 추출
  const baseName = path.basename(originalName, ext); // 확장자를 제외한 파일명 추출
  let uniqueName = originalName; // 기본적으로는 원본 파일명 사용
  let counter = 1;

  // 같은 이름의 파일이 존재하는지 확인하고, 있다면 숫자를 추가
  while (fs.existsSync(path.join(uploadFolder, uniqueName))) {
    uniqueName = `${baseName}(${counter})${ext}`; // 숫자를 추가한 파일명
    counter++; // 숫자 증가
  }

  return uniqueName;
};

// Multer 미들웨어 (이미지 업로드)
const upload = multer({
  storage: multer.diskStorage({
    destination(req, file, done) {
      done(null, path.join(__dirname, "./uploads/profiles")); // 프로필 이미지 저장 경로
    },
    filename(req, file, done) {
      const uniqueFileName = getUniqueFileName(file.originalname, uploadFolder);
      done(null, uniqueFileName); // 파일 이름 설정
    },
  }),
});

const uploadMiddleware = upload.single('picture');
// 정적 파일 제공 (서버의 uploads 폴더를 공개)
// "/uploads" 경로로 접근하는 요청이 실제 파일 시스템에서 uploads 디렉토리와 연결
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(uploadMiddleware);

// passport 미들웨어 등록
app.use(passport.initialize())
app.use(passport.session())

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

initializePassport()

// 부모 경로 (/products) 요청 시, 모듈화 해놓은 router로 이동시키기
app.use("/", rootRouter);

const server = app.listen(port);

// 쪽지 기능
const wss = new WebSocket.Server({ server });
wss.on('connection', async (ws) => {
  console.log('New client connected');

  // 클라이언트 접속 시, 기존 메시지 불러오기
  try {
    const messages = await Message.find({})
      .populate('from', 'email picture')  // from 필드의 사용자 이메일 및 사진 가져오기
      .populate('to', 'email picture')    // to 필드의 사용자 이메일 및 사진 가져오기

    // 기존 메시지들을 클라이언트로 전송
    messages.forEach((msg) => {
      const fromUser = {
        email: msg.from.email,
        picture: msg.from.picture
      };
      
      ws.send(JSON.stringify({
        from: fromUser,
        message: msg.message
      }));
    });

  } catch (error) {
    console.error('Error fetching messages from MongoDB:', error);
  }

  ws.on('message', async (message) => {
    const messageStr = message.toString(); // 버퍼 데이터를 문자열로 변환
    console.log('Received message:', messageStr);

    // JSON으로 파싱 후 처리
    try {
      const data = JSON.parse(messageStr);
      console.log('Parsed message:', data);

      const from = await User.findOne({email : data.from }).populate("snsId");
      const to = await User.findOne({email : data.to }).populate("snsId");
      
      console.log("to", to)
      console.log("from", from)

      // MongoDB에 저장
      const newMessage = new Message({
        from: from._id,
        to: to._id,
        message: data.message,
      });

      await newMessage.save(); // 메시지 저장
      console.log('Message saved to MongoDB');

      const fromUser = {
        email : from.email,
        picture : from.picture
      }

      // JSON 형식으로 응답을 보냄
      ws.send(JSON.stringify({ 
        from: fromUser, 
        message: data.message 
      }));
    } catch (error) {
      console.error('Error parsing message or saving to MongoDB:', error);
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });
});


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

// 이미지 정적 서빙
import path from 'path';
import { fileURLToPath } from 'url';

// 웹소켓
import http from 'http';
import { Server } from 'socket.io';

// dotenv사용
// 다음과 같이 애플리케이션 기본 파일에서 최대한 빨리 가져온다.
import dotenv from 'dotenv';
dotenv.config()

// passport
import passport from "passport";
import { initializePassport } from "./auth/auth.js"

// 구길 로그인 시 세션 필요
import session from "express-session";
import socketRouter from "./routes/socket/socketRouter.js";

// express 실행
const app = express();
const port = 8000;

// MongoDB 연결
connect();

// 채팅 웹소켓과 express 서버 통합
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: "*", methods: ["GET", "POST"] },
});

// passport 미들웨어 등록
app.use(passport.initialize())
initializePassport()

// CORS 허용
app.use(cors({
  origin : 'http://localhost:3000', // 테스트할 땐 * 카드 사용하고 배포할 때 변경
  method : ['GET', 'POST', 'DELETE', 'PUT'],
  credentials : true,
}));

// app.use()는 미들웨어로서,
// 어떤 요청이든 지정된 로직보다 먼저 작업한다. 즉, 전처리이다.
app.use(bodyParser.json()); // request body가 JSON일 때

// extended true면 qs모듈을 사용하여 쿼리스트링으로 인식, false
app.use(express.urlencoded({extended : false}));

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin','*')
  next()
})

// 세션 초기설정
app.use(session({ 
  secret : process.env.SECRET_KEY,
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}))

// uploads폴더 정적 서빙
// __dirname 설정
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// "uploads" 폴더를 정적으로 서빙 (URL: "/uploads/...")
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


// 부모 경로 (/products) 요청 시, 모듈화 해놓은 router로 이동시키기
app.use("/", rootRouter);

// 일반 express 서버 사용시
// const server = app.listen(port);

// 웹소켓 사용시
socketRouter(io);

server.listen(port, () => {
  console.log(`서버가 ${port} 포트에서 실행 중...`);
});



















// app.use(passport.session())

// passport.serializeUser((user, done) => {
//   done(null, user);
// });

// passport.deserializeUser((user, done) => {
//   done(null, user);
// });
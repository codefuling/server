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

app.listen(port);

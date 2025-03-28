import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

// 날짜 형식으로 폴더 생성
const getFormattedDate = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}/${month}/${day}`;
};

// 폴더가 존재하지 않으면 생성
const checkAndCreateDirectory = (folder) => {
  const dirPath = path.join(process.cwd(), 'uploads', folder); // 프로젝트 최상위 경로 사용
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

// Multer 설정
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dateFolder = getFormattedDate(); // '년/월/일' 형식으로 폴더 이름 생성
    const uri = req.originalUrl.split('/');
    const typeFolder = uri[uri.length - 1] || 'default';
    checkAndCreateDirectory(path.join(typeFolder, dateFolder)); // 폴더 생성 확인

    cb(null, path.join('uploads', typeFolder, dateFolder)); // 해당 폴더에 저장
  },
  filename: (req, file, cb) => {
    const fileExtension = path.extname(file.originalname); // 파일의 확장자 추출
    const baseFilename = path.basename(file.originalname, fileExtension); // 확장자를 제외한 원본 파일명
    let filename = uuidv4() + '-' + baseFilename + fileExtension; // UUID와 원본 파일명을 합친 이름 생성
    let filePath = path.join('uploads', getFormattedDate(), filename);
    let counter = 1;

    // 파일이 중복되면 (1), (2)와 같이 숫자를 붙여서 저장
    while (fs.existsSync(filePath)) {
      filename = filename.replace(fileExtension, `(${counter})${fileExtension}`);
      filePath = path.join('uploads', getFormattedDate(), filename);
      counter++;
    }

    cb(null, filename); // 고유한 파일 이름을 설정
  }
});

const upload = multer({ storage });

export { upload };

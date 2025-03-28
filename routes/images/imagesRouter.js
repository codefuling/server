// imagesRouter.js
import express from 'express';
import { upload } from '../../utils/multerConfig.js';
import { thumbnail } from '../../controller/images/images.js';

const imagesRouter = express.Router();

// 이미지 업로드 라우트
imagesRouter.post('/thumbnail', upload.single('images'), thumbnail); // multer로 파일 업로드 후 thumbnail 처리

export default imagesRouter;

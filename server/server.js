// server/server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// 환경에 따라 설정 분리
let config;
if (process.env.NODE_ENV === 'production') {
  // 프로덕션 환경: Render 대시보드에 설정된 환경 변수 사용
  config = {
    DB_USERNAME: process.env.DB_USERNAME,
    DB_PASSWORD: process.env.DB_PASSWORD,
    DB_NAME: process.env.DB_NAME,
  };
} else {
  // 개발 환경: 로컬 dev.js 파일 사용
  config = require("./dev");
}

// Middleware
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5000',
  'https://pswon5894.github.io',
  'https://stock-portfolio-backtest.vercel.app',
  'https://stock-portfolio-backtest-7q7jq7kjw-pswon5894s-projects.vercel.app',
  'https://stock-portfolio-backtest-git-master-pswon5894s-projects.vercel.app',
  'https://stock-portfolio-backtest-lq0z9iqyd-pswon5894s-projects.vercel.app',

];

const corsOptions = {
  origin: function (origin, callback) {
    // 요청 출처(origin)가 허용 목록에 있거나, origin이 없는 경우(예: Postman)
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true); // 허용
    } else {
      callback(new Error('Not allowed by CORS')); // 거부
    }
  },
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());

// 기본 라우트 추가 (테스트용)
app.get('/', (req, res) => {
  res.json({ 
    message: '주식 포트폴리오 백테스트 API 서버',
    status: 'running',
    endpoints: {
      stocks: '/api/stocks',
      // portfolios: '/api/portfolios',
      backtest: '/api/backtest'
    }
  });
});

const username = encodeURIComponent(config.DB_USERNAME);
const password = encodeURIComponent(config.DB_PASSWORD);
const dbName = config.DB_NAME || 'stock-backtest';

const MONGODB_URI = `mongodb+srv://${username}:${password}@cluster0.9tbvkbq.mongodb.net/${dbName}?retryWrites=true&w=majority`;

mongoose.connect(MONGODB_URI, {
  // useNewUrlParser: true,
  // useUnifiedTopology: true,
})
  .then(() => {
    console.log('✅ MongoDB Atlas 연결 성공!');
    console.log(`📦 데이터베이스: ${dbName}`);
    console.log(`🌐 클러스터: cluster0.9tbvkbq.mongodb.net`);
  })
  .catch(err => {
    console.log('❌ MongoDB Atlas 연결 실패');
    console.error('오류:', err.message);
    console.log('\n💡 해결 방법:');
    console.log('1. dev.js 파일의 비밀번호 확인');
    console.log('2. MongoDB Atlas에서 IP 주소 허용 확인 (0.0.0.0/0)');
    console.log('3. 인터넷 연결 상태 확인');
  });

// API Routes
try {
  app.use('/api/stocks', require('./routes/stocks'));
  // app.use('/api/portfolios', require('./routes/portfolios'));
  app.use('/api/backtest', require('./routes/backtest'));
} catch (error) {
  console.log('⚠️  라우트 로딩 중 오류:', error.message);
}

// 에러 핸들링
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: '서버 오류가 발생했습니다' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n 서버가 시작되었습니다!`);
  console.log(` 주소: http://localhost:${PORT}`);
  console.log(`\n사용 가능한 엔드포인트:`);
  console.log(`  - GET  http://localhost:${PORT}/`);
  console.log(`  - GET  http://localhost:${PORT}/api/stocks`);
  // console.log(`  - POST http://localhost:${PORT}/api/portfolios`);
  console.log(`  - POST http://localhost:${PORT}/api/backtest/run`);
  console.log(`\n서버를 중지하려면 Ctrl + C 를 누르세요\n`);
});
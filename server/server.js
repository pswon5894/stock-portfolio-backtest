// // server/server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

const config = require("./dev");

// Middleware
const corsOptions = {
  origin: 'http://localhost:3000',
  optionsSuccessStatus: 200
}

app.use(cors(corsOptions));
app.use(express.json());

// 기본 라우트 추가 (테스트용)
app.get('/', (req, res) => {
  res.json({ 
    message: '주식 포트폴리오 백테스트 API 서버',
    status: 'running',
    endpoints: {
      stocks: '/api/stocks',
      portfolios: '/api/portfolios',
      backtest: '/api/backtest'
    }
  });
});

const username = encodeURIComponent(config.DB_USERNAME);
const password = encodeURIComponent(config.DB_PASSWORD);
const dbName = config.DB_NAME || 'stock-backtest';

// MongoDB 연결 // 로컬 서버에 접속할 경우
// const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/stock-backtest';
// 클라우드 서버에 접속할 때
// mongoose.connect('mongodb://username:password@host:port/database?options...');
// mongodb+srv://pswon5894_db_user:<db_password>@cluster0.9tbvkbq.mongodb.net/?appName=Cluster0
// const MONGODB_URI = process.env.MONGODB_URI || 'pswon5894_db_user:<db_password>@cluster0.9tbvkbq.mongodb.net/?appName=Cluster0'
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
  app.use('/api/portfolios', require('./routes/portfolios'));
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
  console.log(`\n🚀 서버가 시작되었습니다!`);
  console.log(`📍 주소: http://localhost:${PORT}`);
  console.log(`\n사용 가능한 엔드포인트:`);
  console.log(`  - GET  http://localhost:${PORT}/`);
  console.log(`  - GET  http://localhost:${PORT}/api/stocks`);
  console.log(`  - POST http://localhost:${PORT}/api/portfolios`);
  console.log(`  - POST http://localhost:${PORT}/api/backtest/run`);
  console.log(`\n서버를 중지하려면 Ctrl + C 를 누르세요\n`);
});
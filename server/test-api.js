// server/test-api.js
const mongoose = require('mongoose');
const stockService = require('./services/stockService');

async function testAPI() {
  console.log('🧪 Yahoo Finance API 테스트 시작\n');
  
  // MongoDB 연결
  try {
    const config = require('./dev');
    const username = encodeURIComponent(config.DB_USERNAME);
    const password = encodeURIComponent(config.DB_PASSWORD);
    const dbName = config.DB_NAME;
    const MONGODB_URI = `mongodb+srv://${username}:${password}@cluster0.9tbvkbq.mongodb.net/${dbName}?retryWrites=true&w=majority`;
    
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB 연결 성공\n');
  } catch (error) {
    console.log('⚠️  MongoDB 연결 실패 (계속 진행)\n');
  }

  // 1. API 연결 테스트
  await stockService.testAPIConnection();

  // 2. 실제 종목 테스트
  console.log('\n📊 실제 종목 데이터 다운로드 테스트...\n');
  
  const testTickers = ['AAPL', 'MSFT', 'GOOGL'];
  
  for (const ticker of testTickers) {
    try {
      const data = await stockService.getStockData(ticker, '2023-01-01', '2023-12-31');
      console.log(`✅ ${ticker}: ${data.length}일`);
      console.log(`   첫날: ${data[0].date.toLocaleDateString()} 종가: $${data[0].close.toFixed(2)}`);
      console.log(`   마지막: ${data[data.length-1].date.toLocaleDateString()} 종가: $${data[data.length-1].close.toFixed(2)}`);
      
      if (ticker !== testTickers[testTickers.length - 1]) {
        console.log('   ⏳ 1초 대기...\n');
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    } catch (error) {
      console.error(`❌ ${ticker} 실패:`, error.message);
    }
  }

  // 3. 여러 종목 동시 테스트
  console.log('\n📊 포트폴리오 백테스트 시뮬레이션...\n');
  
  try {
    const portfolio = ['AAPL', 'MSFT'];
    const stockData = await stockService.getMultipleStocksData(
      portfolio,
      '2020-01-01',
      '2023-12-31'
    );
    
    console.log('\n✅ 포트폴리오 데이터 수집 완료:');
    Object.keys(stockData).forEach(ticker => {
      if (stockData[ticker]) {
        console.log(`   ${ticker}: ${stockData[ticker].length}일`);
      } else {
        console.log(`   ${ticker}: ❌ 실패`);
      }
    });
  } catch (error) {
    console.error('❌ 포트폴리오 테스트 실패:', error.message);
  }

  // 종료
  await mongoose.disconnect();
  console.log('\n🏁 테스트 완료');
  process.exit(0);
}

testAPI();
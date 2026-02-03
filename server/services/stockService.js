// server/services/stockService.js
const yahooFinance = require('yahoo-finance2').default;
const Stock = require('../models/Stock');

class StockService {
  constructor() {
    // YahooFinance 인스턴스 생성
    this.yahooFinance = new yahooFinance();
    console.log('✅ Yahoo Finance 서비스 초기화');
  }

  // Yahoo Finance에서 실제 주식 데이터 가져오기
  async fetchStockDataFromAPI(ticker, startDate, endDate) {
    console.log(`📡 ${ticker} 데이터 다운로드 중... (Yahoo Finance)`);

    try {
      const start = new Date(startDate);
      const end = new Date(endDate);

      // Yahoo Finance에서 데이터 가져오기
      const queryOptions = {
        period1: start,
        period2: end,
        interval: '1d'
      };

      const result = await this.yahooFinance.historical(ticker, queryOptions);

      if (!result || result.length === 0) {
        throw new Error(`${ticker}의 데이터를 찾을 수 없습니다`);
      }

      // 데이터 변환
      const historicalData = result.map(item => ({
        date: new Date(item.date),
        open: item.open,
        high: item.high,
        low: item.low,
        close: item.close,
        volume: item.volume,
        adjustedClose: item.adjClose || item.close
      })).sort((a, b) => a.date - b.date);

      console.log(`✅ ${ticker} 데이터 다운로드 완료 (${historicalData.length}일)`);
      
      return historicalData;
    } catch (error) {
      console.error(`❌ ${ticker} 다운로드 실패:`, error.message);
      throw new Error(`${ticker} 데이터를 가져올 수 없습니다: ${error.message}`);
    }
  }

  // MongoDB에서 데이터 조회 또는 API에서 가져오기
  async getStockData(ticker, startDate, endDate) {
  try {
    const upperTicker = ticker.toUpperCase();
    let stock = await Stock.findOne({ ticker: upperTicker });

    const requestedStart = new Date(startDate);
    const requestedEnd = new Date(endDate);

    let needRefetch = false;

    if (stock && stock.historicalData && stock.historicalData.length > 0) {
      const dbStart = new Date(stock.historicalData[0].date);
      const dbEnd = new Date(
        stock.historicalData[stock.historicalData.length - 1].date
      );

      // 요청한 기간이 DB 범위를 벗어나면 재호출
      if (requestedStart < dbStart || requestedEnd > dbEnd) {
        needRefetch = true;
        console.log(`⚠️ ${ticker} DB 데이터 범위 부족`);
      }
    }

    // DB에 없거나 / 비어있거나 / 범위 부족하면 API 호출
    if (!stock || !stock.historicalData?.length || needRefetch) {
      console.log(`🔄 ${ticker} API에서 데이터 재요청`);

      // buffer 1년
      const cacheStartDate = new Date(requestedStart);
      cacheStartDate.setFullYear(cacheStartDate.getFullYear() - 1);

      const historicalData = await this.fetchStockDataFromAPI(
        ticker,
        cacheStartDate.toISOString().split('T')[0],
        endDate
      );

      stock = await Stock.findOneAndUpdate(
        { ticker: upperTicker },
        {
          ticker: upperTicker,
          name: ticker,
          market: 'US',
          historicalData,
        },
        { upsert: true, new: true }
      );

      console.log(`💾 ${ticker} 데이터베이스 저장 완료`);
    } else {
      console.log(
        `✅ ${ticker} 캐시 사용 (${stock.lastUpdated?.toLocaleDateString()})`
      );
    }

    // 날짜 필터링
    const filteredData = stock.historicalData.filter(d => {
      const date = new Date(d.date);
      return date >= requestedStart && date <= requestedEnd;
    });

    console.log(
      `   - 필터링된 데이터: ${filteredData.length}일 (${startDate} ~ ${endDate})`
    );

    if (filteredData.length === 0) {
      throw new Error('요청한 기간의 데이터가 없습니다');
    }

    return filteredData;
  } catch (error) {
    throw new Error(`${ticker} 데이터 조회 실패: ${error.message}`);
  }
}

  // 여러 종목 데이터 한번에 가져오기
  async getMultipleStocksData(tickers, startDate, endDate) {
    const results = {};
    
    for (let i = 0; i < tickers.length; i++) {
      const ticker = tickers[i];
      
      try {
        console.log(`\n[${i + 1}/${tickers.length}] ${ticker} 처리 중...`);
        results[ticker] = await this.getStockData(ticker, startDate, endDate);
        
        // Yahoo Finance는 제한이 없지만 안전하게 1초 대기
        if (i < tickers.length - 1) {
          console.log('⏳ 1초 대기...');
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      } catch (error) {
        console.error(`❌ ${ticker} 오류:`, error.message);
        results[ticker] = null;
      }
    }
    
    return results;
  }

  // API 연결 테스트
  async testAPIConnection() {
    console.log('\n🔍 Yahoo Finance API 연결 테스트...');
    
    try {
      const testDate = new Date();
      testDate.setMonth(testDate.getMonth() - 1);
      
      const result = await this.yahooFinance.historical('AAPL', {
        period1: testDate,
        period2: new Date(),
        interval: '1d'
      });
      
      if (result && result.length > 0) {
        console.log('✅ Yahoo Finance 연결 성공!');
        console.log(`   - 테스트 데이터: ${result.length}일`);
        console.log(`   - 최근 AAPL 종가: $${result[result.length - 1].close.toFixed(2)}`);
        return true;
      } else {
        console.error('❌ 데이터 없음');
        return false;
      }
    } catch (error) {
      console.error('❌ Yahoo Finance 테스트 실패:', error.message);
      return false;
    }
  }
}

module.exports = new StockService();
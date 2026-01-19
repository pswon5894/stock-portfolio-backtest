// server/services/backtestService.js
const stockService = require('./stockService');
const BacktestResult = require('../models/BacktestResult');

class BacktestService {
  async runBacktest(portfolioData) {
    const { holdings, initialCapital, startDate, endDate } = portfolioData;
    
    console.log('\n🚀 백테스트 시작');
    console.log(`포트폴리오: ${portfolioData.name || '무제'}`);
    console.log(`기간: ${startDate} ~ ${endDate}`);
    console.log(`초기 자본: ${initialCapital.toLocaleString()}원`);
    
    try {
      // 1. 모든 종목 데이터 가져오기
      const tickers = holdings.map(h => h.ticker);
      console.log(`\n📊 종목 데이터 수집 중... (${tickers.join(', ')})`);
      
      const stockData = await stockService.getMultipleStocksData(
        tickers,
        startDate,
        endDate
      );

      // 데이터 검증
      const missingTickers = tickers.filter(t => !stockData[t] || stockData[t].length === 0);
      if (missingTickers.length > 0) {
        throw new Error(`다음 종목의 데이터를 찾을 수 없습니다: ${missingTickers.join(', ')}`);
      }

      // 2. 백테스트 실행 (Buy & Hold)
      console.log('\n💰 포트폴리오 시뮬레이션 중...');
      const simulation = this.simulateBuyAndHold(stockData, holdings, initialCapital);

      // 3. 성과 지표 계산
      console.log('\n📈 성과 지표 계산 중...');
      const performance = this.calculatePerformance(simulation.equityCurve, initialCapital);

      // 4. 결과 저장
      const result = {
        portfolioName: portfolioData.name,
        performance,
        equityCurve: simulation.equityCurve,
        trades: simulation.trades,
        settings: {
          startDate,
          endDate,
          initialCapital
        }
      };

      console.log('\n✅ 백테스트 완료!');
      console.log(`총 수익률: ${performance.totalReturn}%`);
      console.log(`연환산 수익률: ${performance.annualizedReturn}%`);
      
      return result;
    } catch (error) {
      console.error('\n❌ 백테스트 실패:', error.message);
      throw error;
    }
  }

  // Buy & Hold 전략 시뮬레이션
  simulateBuyAndHold(stockData, holdings, initialCapital) {
    const equityCurve = [];
    const trades = [];
    
    // 모든 거래일 가져오기
    const allDates = this.getAllTradingDates(stockData);
    
    if (allDates.length === 0) {
      throw new Error('거래일 데이터가 없습니다');
    }

    console.log(`   - 거래일 수: ${allDates.length}일`);

    // 초기 매수 (첫날)
    const firstDate = allDates[0];
    const positions = {}; // { ticker: shares }
    let cash = initialCapital;

    holdings.forEach(holding => {
      const ticker = holding.ticker;
      const targetAmount = (initialCapital * holding.weight) / 100;
      const priceData = this.getPriceAtDate(stockData[ticker], firstDate);
      
      if (priceData) {
        const shares = Math.floor(targetAmount / priceData.close);
        const cost = shares * priceData.close;
        
        positions[ticker] = shares;
        cash -= cost;
        
        trades.push({
          date: new Date(firstDate),
          ticker,
          action: 'buy',
          shares,
          price: priceData.close,
          amount: cost
        });
      }
    });

    console.log(`   - 초기 매수 완료: ${Object.keys(positions).length}개 종목`);

    // 매일 포트폴리오 가치 계산
    allDates.forEach((date, index) => {
      let portfolioValue = cash;
      
      Object.keys(positions).forEach(ticker => {
        const priceData = this.getPriceAtDate(stockData[ticker], date);
        if (priceData) {
          portfolioValue += positions[ticker] * priceData.close;
        }
      });
      
      equityCurve.push({
        date: new Date(date),
        value: portfolioValue
      });
      
      // 진행 상황 출력 (10% 간격)
      if (index % Math.floor(allDates.length / 10) === 0) {
        const progress = Math.floor((index / allDates.length) * 100);
        console.log(`   - 진행률: ${progress}%`);
      }
    });

    return { equityCurve, trades };
  }

  // 모든 거래일 추출
  getAllTradingDates(stockData) {
    const datesSet = new Set();
    
    Object.values(stockData).forEach(data => {
      if (data) {
        data.forEach(d => {
          datesSet.add(d.date.toISOString().split('T')[0]);
        });
      }
    });
    
    return Array.from(datesSet).sort();
  }

  // 특정 날짜의 가격 조회
  getPriceAtDate(stockHistory, targetDate) {
    if (!stockHistory || stockHistory.length === 0) return null;
    
    return stockHistory.find(d => 
      d.date.toISOString().split('T')[0] === targetDate
    );
  }

  // 성과 지표 계산
  calculatePerformance(equityCurve, initialCapital) {
    if (equityCurve.length === 0) {
      throw new Error('자산 곡선 데이터가 없습니다');
    }

    const initialValue = equityCurve[0].value;
    const finalValue = equityCurve[equityCurve.length - 1].value;

    // 1. 총 수익률
    const totalReturn = ((finalValue - initialValue) / initialValue) * 100;

    // 2. 연환산 수익률
    const years = equityCurve.length / 252; // 연간 약 252 거래일
    const annualizedReturn = years > 0 
      ? (Math.pow(finalValue / initialValue, 1 / years) - 1) * 100 
      : 0;

    // 3. 일일 수익률 계산
    const dailyReturns = [];
    for (let i = 1; i < equityCurve.length; i++) {
      const ret = (equityCurve[i].value - equityCurve[i-1].value) / equityCurve[i-1].value;
      dailyReturns.push(ret);
    }

    // 4. 변동성 (연환산)
    const volatility = dailyReturns.length > 0
      ? this.standardDeviation(dailyReturns) * Math.sqrt(252) * 100
      : 0;

    // 5. 샤프 비율 (무위험 수익률 2% 가정)
    const riskFreeRate = 2;
    const sharpeRatio = volatility > 0
      ? (annualizedReturn - riskFreeRate) / volatility
      : 0;

    // 6. 최대 낙폭 (MDD)
    let maxDrawdown = 0;
    let peak = equityCurve[0].value;
    
    equityCurve.forEach(point => {
      if (point.value > peak) peak = point.value;
      const drawdown = ((peak - point.value) / peak) * 100;
      if (drawdown > maxDrawdown) maxDrawdown = drawdown;
    });

    // 7. 승률
    const winningDays = dailyReturns.filter(r => r > 0).length;
    const winRate = dailyReturns.length > 0
      ? (winningDays / dailyReturns.length) * 100
      : 0;

    // 8. 최종 자산
    const finalAmount = finalValue;
    const profit = finalValue - initialValue;

    return {
      totalReturn: totalReturn.toFixed(2),
      annualizedReturn: annualizedReturn.toFixed(2),
      sharpeRatio: sharpeRatio.toFixed(2),
      maxDrawdown: maxDrawdown.toFixed(2),
      volatility: volatility.toFixed(2),
      winRate: winRate.toFixed(2),
      finalAmount: Math.round(finalAmount),
      profit: Math.round(profit),
      tradingDays: equityCurve.length
    };
  }

  // 표준편차 계산
  standardDeviation(values) {
    if (values.length === 0) return 0;
    
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    const squareDiffs = values.map(value => Math.pow(value - avg, 2));
    const avgSquareDiff = squareDiffs.reduce((a, b) => a + b, 0) / squareDiffs.length;
    
    return Math.sqrt(avgSquareDiff);
  }
}

module.exports = new BacktestService();
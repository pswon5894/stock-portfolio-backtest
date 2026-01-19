// server/routes/backtest.js
const express = require('express');
const router = express.Router();
const backtestService = require('../services/backtestService');

// 백테스트 실행
router.post('/run', async (req, res) => {
  try {
    const { portfolio, startDate, endDate } = req.body;
    
    if (!portfolio || !startDate || !endDate) {
      return res.status(400).json({ 
        error: '포트폴리오, 시작일, 종료일은 필수입니다' 
      });
    }

    if (!portfolio.holdings || portfolio.holdings.length === 0) {
      return res.status(400).json({ 
        error: '최소 1개 종목이 필요합니다' 
      });
    }

    // 포트폴리오 데이터 준비
    const portfolioData = {
      name: portfolio.name,
      holdings: portfolio.holdings,
      initialCapital: portfolio.initialCapital || 10000000,
      startDate,
      endDate
    };
    
    console.log('\n' + '='.repeat(50));
    console.log('📨 백테스트 요청 받음');
    console.log('='.repeat(50));
    
    const result = await backtestService.runBacktest(portfolioData);
    
    res.json(result);
  } catch (error) {
    console.error('❌ 백테스트 오류:', error);
    res.status(500).json({ 
      error: error.message || '백테스트 실행 중 오류가 발생했습니다' 
    });
  }
});

module.exports = router;
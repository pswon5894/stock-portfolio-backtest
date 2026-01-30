// server/routes/backtest.js
const express = require('express');
const router = express.Router();
const backtestService = require('../services/backtestService');
const BacktestResult = require('../models/BacktestResult');

// 상위 랭킹 조회 (연평균 수익률 기준)
router.get('/rankings', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 3;
    
    // console.log(`Top ${limit} 랭킹 조회 요청`);
    
    const topResults = await BacktestResult.find({ isPublic: true })
      .sort({ 'performance.annualizedReturn': -1 })
      .limit(limit)
      .select('portfolioName performance.annualizedReturn performance.totalReturn createdAt')
      .lean();
    
    // console.log(` ${topResults.length}개 랭킹 결과 반환`);
    
    res.json(topResults);
  } catch (error) {
    console.error(' 랭킹 조회 오류:', error);
    res.status(500).json({ 
      error: '랭킹을 불러올 수 없습니다',
      message: error.message 
    });
  }
});

// 백테스트 실행 및 저장
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
    console.log('백테스트 요청 받음');
    console.log('='.repeat(50));
    
    // 백테스트 실행
    const result = await backtestService.runBacktest(portfolioData);
    
    //  MongoDB에 백테스트 결과 저장
    const savedResult = new BacktestResult({
      portfolioName: portfolio.name,
      holdings: portfolio.holdings,
      performance: result.performance,
      equityCurve: result.equityCurve,
      trades: result.trades,
      settings: {
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        initialCapital: portfolio.initialCapital
      },
      isPublic: true
    });
    
    // console.log('--- Saving Backtest Result ---');
    // console.log('Data to Save:', JSON.stringify(savedResult.toObject(), null, 2));
    
    await savedResult.save();
    console.log(` 백테스트 결과 저장 완료 (ID: ${savedResult._id})`);

    // 저장 후 전체 결과 가져오기 (annualizedReturn 기준 내림차순)
    const results = await BacktestResult.find()
      .sort({ 'performance.annualizedReturn': -1 });

    // 5개 초과하면 삭제 해서 4개 보관
    if (results.length > 4) {
      const toDelete = results.slice(4); // 5번째 부터 삭제 해서 4개 보관
      const ids = toDelete.map(r => r._id);
      await BacktestResult.deleteMany({ _id: { $in: ids } });
      console.log(`🗑 annualizedReturn 낮은 결과 ${ids.length}개 삭제`);
    }

    // 결과에 ID 포함해서 반환
    res.json({
      ...result,
      _id: savedResult._id
    });
  } catch (error) {
    console.error('❌ 백테스트 오류:', error);
    res.status(500).json({ 
      error: error.message || '백테스트 실행 중 오류가 발생했습니다' 
    });
  }
});

// 📄 특정 백테스트 결과 상세 조회
router.get('/results/:id', async (req, res) => {
  try {
    const result = await BacktestResult.findById(req.params.id);
    
    if (!result) {
      return res.status(404).json({ error: '결과를 찾을 수 없습니다' });
    }
    
    console.log(`📖 백테스트 결과 조회: ${result.portfolioName}`);
    
    res.json(result);
  } catch (error) {
    console.error('❌ 결과 조회 오류:', error);
    res.status(500).json({ error: '결과를 불러올 수 없습니다' });
  }
});

// 📊 모든 백테스트 결과 조회 (페이지네이션)
router.get('/results', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const results = await BacktestResult.find({ isPublic: true })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('portfolioName performance settings createdAt');
    
    const total = await BacktestResult.countDocuments({ isPublic: true });
    
    res.json({
      results,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('❌ 결과 목록 조회 오류:', error);
    res.status(500).json({ error: '결과 목록을 불러올 수 없습니다' });
  }
});

module.exports = router;
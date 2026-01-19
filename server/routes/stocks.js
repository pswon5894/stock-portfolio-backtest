// server/routes/stocks.js
const express = require('express');
const router = express.Router();
const Stock = require('../models/Stock');
const stockService = require('../services/stockService');

// 주식 검색
router.get('/search', async (req, res) => {
  try {
    const { query } = req.query;
    const stocks = await Stock.find({
      $or: [
        { ticker: new RegExp(query, 'i') },
        { name: new RegExp(query, 'i') }
      ]
    }).limit(10);
    res.json(stocks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 특정 주식의 히스토리 데이터 조회
router.get('/:ticker/history', async (req, res) => {
  try {
    const { ticker } = req.params;
    const { startDate, endDate } = req.query;
    
    let stock = await Stock.findOne({ ticker });
    
    if (!stock) {
      // DB에 없으면 외부 API에서 가져오기
      stock = await stockService.fetchAndSaveStock(ticker, startDate, endDate);
    }
    
    // 날짜 필터링
    const filteredData = stock.historicalData.filter(d => {
      const date = new Date(d.date);
      return date >= new Date(startDate) && date <= new Date(endDate);
    });
    
    res.json({ ticker, data: filteredData });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
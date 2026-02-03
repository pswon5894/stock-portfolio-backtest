// server/models/BacktestResult.js
const mongoose = require('mongoose');

const backtestResultSchema = new mongoose.Schema({
  // portfolioId: { type: mongoose.Schema.Types.ObjectId, ref: 'Portfolio' },
  portfolioName: { type: String, required: true },
  isPublic: { type: Boolean, default: true },

  // 보유 종목
  holdings: [{
    ticker: String,
    name: String,
    weight: Number
  }],

  settings: {
    startDate: { type: Date, required: true },  // 최초 거래일 (오래된 데이터)
    endDate: { type: Date, required: true },    // 최종 거래일 (최신 데이터)
    initialCapital: { type: Number, required: true }
  },

  performance: {
    totalReturn: Number,
    annualizedReturn: Number,
    sharpeRatio: Number,
    maxDrawdown: Number,
    volatility: Number,
    winRate: Number,
    finalAmount: Number,
    profit: Number
  },
  equityCurve: [{
    date: Date,
    value: Number
  }],
  trades: [{
    date: Date,
    ticker: String,
    action: { type: String, enum: ['buy', 'sell'] },
    shares: Number,
    price: Number
  }],
  // runDate: { type: Date, default: Date.now }
});

module.exports = mongoose.model('BacktestResult', backtestResultSchema);
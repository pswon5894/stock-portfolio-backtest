// server/models/BacktestResult.js
const mongoose = require('mongoose');

const backtestResultSchema = new mongoose.Schema({
  // portfolioId: { type: mongoose.Schema.Types.ObjectId, ref: 'Portfolio' },
  name: { type: String, required: true },
  performance: {
    totalReturn: Number,
    annualizedReturn: Number,
    sharpeRatio: Number,
    maxDrawdown: Number,
    volatility: Number
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
  runDate: { type: Date, default: Date.now }
});

module.exports = mongoose.model('BacktestResult', backtestResultSchema);
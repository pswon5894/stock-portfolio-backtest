// server/models/Stock.js
const mongoose = require('mongoose');

const stockSchema = new mongoose.Schema({
  ticker: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  market: { type: String, enum: ['KRX', 'NASDAQ', 'NYSE'] },
  sector: String,
  historicalData: [{
    date: Date,
    open: Number,
    high: Number,
    low: Number,
    close: Number,
    volume: Number,
    adjustedClose: Number
  }],
  // lastUpdated: { type: Date, default: Date.now } //db 캐싱 여부 확인용(업데이트 여부로 캐싱 확인)
});

module.exports = mongoose.model('Stock', stockSchema);
// server/scripts/fetchStockData.js
const axios = require('axios');
const Stock = require('../models/Stock');

async function downloadStockData() {
  const API_KEY = 'ALPHA_VANTAGE_API_KEY';
  const tickers = ['AAPL', 'MSFT', 'GOOGL', 'TSLA', 'NVDA'];
  
  for (const ticker of tickers) {
    const url = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${ticker}&outputsize=full&apikey=${API_KEY}`;
    
    const response = await axios.get(url);
    const timeSeries = response.data['Time Series (Daily)'];
    
    const historicalData = Object.keys(timeSeries).map(date => ({
      date: new Date(date),
      close: parseFloat(timeSeries[date]['4. close']),
      open: parseFloat(timeSeries[date]['1. open']),
      high: parseFloat(timeSeries[date]['2. high']),
      low: parseFloat(timeSeries[date]['3. low']),
      volume: parseInt(timeSeries[date]['5. volume'])
    }));
    
    await Stock.findOneAndUpdate(
      { ticker },
      { ticker, name: ticker, historicalData },
      { upsert: true }
    );
    
    console.log(`✅ ${ticker} 데이터 저장 완료`);
    
    // API 제한 때문에 대기 (1분에 5요청 제한)
    await new Promise(resolve => setTimeout(resolve, 12000));
  }
}

downloadStockData();
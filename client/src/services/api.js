// client/src/services/api.js
import axios from 'axios';

// 개발 환경에서는 http://localhost:5000/api, 프로덕션 환경에서는 배포된 서버 주소 사용
const API_BASE_URL = process.env.NODE_ENV === 'production'
  ? 'https://stock-portfolio-backtest.onrender.com/'
  : 'http://localhost:5000/api';

export const stockAPI = {
  searchStocks: (query) => 
    axios.get(`${API_BASE_URL}/stocks/search?query=${query}`),
  
  getStockHistory: (ticker, startDate, endDate) =>
    axios.get(`${API_BASE_URL}/stocks/${ticker}/history`, {
      params: { startDate, endDate }
    })
};

export const portfolioAPI = {
  create: (portfolio) =>
    axios.post(`${API_BASE_URL}/portfolios`, portfolio),
  
  getAll: () =>
    axios.get(`${API_BASE_URL}/portfolios`),
  
  getById: (id) =>
    axios.get(`${API_BASE_URL}/portfolios/${id}`),

  update: (id, portfolio) =>
    axios.put(`${API_BASE_URL}/portfolios/${id}`, portfolio),

  delete: (id) =>
    axios.delete(`${API_BASE_URL}/portfolios/${id}`),
};

export const backtestAPI = {
  run: (portfolioData) =>
    axios.post(`${API_BASE_URL}/backtest/run`, {
      portfolio: {
        name: portfolioData.name,
        holdings: portfolioData.holdings,
        initialCapital: portfolioData.initialCapital
      },
      startDate: portfolioData.startDate,
      endDate: portfolioData.endDate
    })
};
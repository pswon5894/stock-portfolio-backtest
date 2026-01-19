// client/src/services/api.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

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
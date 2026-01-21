// src/components/RankingBoard.jsx
import React, { useState, useEffect } from 'react';

function RankingBoard({ onSelectPortfolio }) {
  const [rankings, setRankings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRankings();
  }, []);

  const fetchRankings = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/backtest/rankings?limit=3');
      if (response.ok) {
        const data = await response.json();
        setRankings(data);
      }
    } catch (error) {
      console.error('랭킹 조회 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMedalEmoji = (rank) => {
    switch(rank) {
      case 0: return '🥇';
      case 1: return '🥈';
      case 2: return '🥉';
      default: return '';
    }
  };

  if (loading) {
    return (
      <div className="ranking-board">
        <h2>🏆 Top 3 포트폴리오</h2>
        <div className="loading-text">로딩 중...</div>
      </div>
    );
  }

  if (rankings.length === 0) {
    return (
      <div className="ranking-board">
        <h2>🏆 Top 3 포트폴리오</h2>
        <div className="empty-rankings">
          <p>아직 등록된 백테스트 결과가 없습니다.</p>
          <p>첫 번째 포트폴리오를 만들어보세요! 🚀</p>
        </div>
      </div>
    );
  }

  return (
    <div className="ranking-board">
      <h2>🏆 Top 3 포트폴리오</h2>
      <p className="ranking-subtitle">연평균 수익률 기준</p>
      
      <div className="ranking-list">
        {rankings.map((portfolio, index) => (
          <div 
            key={portfolio._id}
            className={`ranking-item rank-${index + 1}`}
            onClick={() => onSelectPortfolio(portfolio._id)}
          >
            <div className="ranking-medal">
              {getMedalEmoji(index)}
            </div>
            
            <div className="ranking-info">
              <div className="ranking-name">
                {portfolio.portfolioName}
              </div>
              <div className="ranking-date">
                {new Date(portfolio.createdAt).toLocaleDateString()}
              </div>
            </div>
            
            <div className="ranking-performance">
              <div className="performance-value">
                {parseFloat(portfolio.performance.annualizedReturn).toFixed(2)}%
              </div>
              <div className="performance-label">
                연평균 수익률
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default RankingBoard;
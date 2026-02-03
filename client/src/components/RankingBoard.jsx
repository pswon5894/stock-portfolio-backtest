import React from 'react';
import { useThemeStore } from "../theme/themeStore";

function RankingBoard({ rankings, rankingsLoading, onSelectPortfolio }) {
  const darkMode = useThemeStore((state) => state.darkMode);
  const getMedalEmoji = (rank) => {
    switch(rank) {
      case 0: return '🥇';
      case 1: return '🥈';
      case 2: return '🥉';
      default: return '';
    }
  };

  if (rankingsLoading) {
    return (
      <div className={`ranking-board ${darkMode ? 'dark' : ''}`}>
        <h2>🏆 Top 3 포트폴리오</h2>
        <div className="loading-text">로딩 중...</div>
      </div>
    );
  }

  if (rankings.length === 0) {
    return (
      <div className={`ranking-board ${darkMode ? 'dark' : ''}`}>
        <h2>🏆 Top 3 포트폴리오</h2>
        <div className="empty-rankings">
          <p>아직 등록된 백테스트 결과가 없습니다.</p>
          <p>첫 번째 포트폴리오를 만들어보세요! 🚀</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`ranking-board ${darkMode ? 'dark' : ''}`}>
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
            </div>
            
            <div className="ranking-performance">
              <div className="performance-label">
                연평균 수익률
              </div>
              <div className="performance-value">
               {portfolio.performance?.annualizedReturn
                  ? `${parseFloat(portfolio.performance.annualizedReturn).toFixed(2)}%`
                  : 'N/A'}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default RankingBoard;
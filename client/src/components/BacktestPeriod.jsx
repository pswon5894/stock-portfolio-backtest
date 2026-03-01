// components/BacktestPeriod.js
import React from "react";

const BacktestPeriod =({
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    portfolioName,
    initialCapital,
    holdings,
    setStep,
    runBacktest,
}) => {
    
    // 핸들러 함수는 onClick이 전달하는 event 객체를 무시, 원하는 최신 state 값들을 전달
    const handleRunBacktest = () => {
        runBacktest({
        setStep,
        portfolioName,
        holdings,
        initialCapital,
        startDate,
        endDate,
        });
    };

    return ( 
        <div className="card">
            <h2>4️⃣ 백테스트 기간 설정</h2>
        
        <div className="form-group">
            <label>시작일</label>
            <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="input"
            />
        </div>

        <div className="form-group">
            <label>종료일</label>
            <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="input"
            />
        </div>

        <div className="info-box">
            <h4>💡 투자 방식: Buy & Hold</h4>
            <p>초기에 설정한 비중대로 매수 후 만기까지 보유합니다.</p>
            <p>리밸런싱 없이 장기 투자 성과를 확인할 수 있습니다.</p>
        </div>

        <div className="summary">
            <h3>📋 설정 요약</h3>
            <p><strong>포트폴리오:</strong> {portfolioName}</p>
            <p><strong>초기 투자금:</strong> {initialCapital.toLocaleString()}원</p>
            <p><strong>종목 수:</strong> {holdings.length}개</p>
            <p><strong>기간:</strong> {startDate} ~ {endDate}</p>
        </div>

        <div className="button-group">
            <button onClick={() => setStep(3)} className="button secondary">
            ← 이전
            </button>
            runBacktest(event) 형태로 호출되어 event 객체가 들어감
            <button onClick={handleRunBacktest} className="button">
            백테스트 실행 🚀
            </button>
        </div>
        </div>
    )
}

export default BacktestPeriod;
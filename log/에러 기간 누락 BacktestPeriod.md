// src/hooks/useBacktest.js 만드니까 에러 날짜를 못받아옴

alert
서버에서 실제 데이터를 가져올 수 없어 모의 데이터를 표시합니다
에러: 포트폴리오, 시작일, 종료일은 필수입니다.

```js
// src/hooks/useBacktest.js
alert('⚠️ 서버에서 실제 데이터를 가져올 수 없어 모의 데이터를 표시합니다.\n에러: ' + error.message);
```

기간에 관련된 부분을 찾아보면
App.jsx 에서 BacktestPeriod, startDate={startDate}, endDate={endDate}

```js
// client/src/App.jsx

{/* ========== Step 4: 백테스트 기간 설정 ========== */}
        {step === 4 && (
          <BacktestPeriod                   // 기간
            startDate={startDate}           // 기간
            setStartDate={setStartDate}
            endDate={endDate}               // 기간
            setEndDate={setEndDate}
            portfolioName={portfolioName}
            initialCapital={initialCapital}
            holdings={holdings}
            setStep={setStep}
            runBacktest={runBacktest}
          />
        )}
```


```js
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

        <div className="button-group">
            <button onClick={() => setStep(3)} className="button secondary">
            ← 이전
            </button>
            <button onClick={runBacktest} className="button">         
            백테스트 실행 🚀
            </button>
        </div>
        </div>
    )
}

export default BacktestPeriod;
```

onClick={runBacktest}

// onClick은 자동으로 event 객체를 인자로 전달
onClick={runBacktest}  
// 실제로는 이렇게 호출됨: runBacktest(event)

onClick={(event) => runBacktest(event)}

// runBacktest는 이런 구조의 객체를 원함
runBacktest({
  setStep,
  portfolioName,
  holdings,
  // ...
})

// 하지만 onClick={runBacktest}로 직접 연결하면
// runBacktest(event) 형태로 호출되어 event 객체가 들어감


## 해결 방법: 래퍼 함수(핸들러)

```js
const handleRunBacktest = () => {
  // 최신 state 값들을 직접 모아서
  runBacktest({
    setStep,
    portfolioName,
    holdings,
    initialCapital,
    startDate,
    endDate,
  });
};
```
// 이제 onClick에서 사용
<button onClick={handleRunBacktest}>
//핸들러 사용 시 장점
// handleRunBacktest가 먼저 호출됨 (event 객체는 무시)
// 그 안에서 필요한 데이터만 골라서 runBacktest에 전달
// 최신 state 값들이 정확하게 전달됨

핸들러 함수는 onClick이 전달하는 event 객체를 무시, 원하는 최신 state 값들을 전달



runBacktest는 인자를 받아야 하는 함수다

onClick은 자동으로 event를 넘긴다

그래서 우리가 원하는 데이터를 직접 넘겨야 한다

최신 state 값을 보장하려면 호출 시점에 전달해야 한다

핸들러는 "최신 state 값을 모아서 넘기기 위한 래퍼 함수"

안 만들면 event 객체가 들어가서 값이 깨짐
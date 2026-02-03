https://stock-portfolio-backtest.vercel.app/
vercel 배포 주소 + render(초기 구동 콜드 스립 깨울 때만 느림)
15분간 미사용시 콜드 슬립, 깨어나는데 30초정도 걸림

# 프로젝트 설명

클라이언트-서버 아키텍처를 기반으로 한 주식 포트폴리오 백테스팅 웹. 사용자가 웹 인터페이스(클라이언트)를 통해 포트폴리오를 구성하면,
서버는 이 데이터를 받아 수익률을 계산하고 결과를 다시 클라이언트에 보여줌.

## 1. 전체 아키텍처

주요 기술 스택

   * 클라이언트 (Client):
       * React: 사용자 인터페이스(UI)를 구축하기 위한 JavaScript 라이브러리.
       * Axios/Fetch: 서버와 HTTP 통신을 위한 라이브러리. (client/src/App.jsx 내에서 직접 fetch 사용)
       * zustand: 다크모드 테마 상태관리, 전역 상태관리 용이, localstorage 이용해서 테마상태 기억
   * 서버 (Server):
       * Node.js & Express: 서버를 구축하고 REST API를 만들기 위한 프레임워크.
       * MongoDB & Mongoose: 백테스트 결과와 주식 데이터를 저장하기 위한 NoSQL 데이터베이스. API에서 가져온 주식 데이터를 캐싱 및 저장
   * api 데이터 소스:
       * Yahoo Finance API: stockService를 통해 주식의 데이터를 가져오는 외부 API.


## 2. 핵심 실행 흐름

   1. 포트폴리오 구성 (Client):
       * 사용자는 client/src/App.jsx 컴포넌트를 통해 UI와 상호작용.
       * 주식을 선택하고, 각 주식의 비중(가중치)과 백테스트 기간을 입력하여 포트폴리오를 구성.

   2. 백테스트 요청 (Client → Server):
       * 사용자가 '백테스트 실행' 버튼을 클릭하면 App.jsx의 runBacktest 함수가 호출됨.
       * 이 함수는 구성된 포트폴리오 정보를 담아 서버의 POST /api/backtest/run 엔드포인트로 HTTP 요청을 보냄.

   3. API 요청 처리 (Server):
       * server/routes/backtest.js 라우터가 이 요청을 받아 backtestService.js의 runBacktest 함수를 호출.

   4. 과거 데이터 조회 (Server):
       * backtestService는 `stockService.js`의 getStockData 함수를 호출하여 포트폴리오에 포함된 각 주식의 과거 데이터를 요청.
       * 캐싱(Caching) 로직: stockService는 먼저 내부 MongoDB 데이터베이스(Stock 모델)에 해당 주식 데이터가 있는지 확인.
           * 데이터가 있으면: DB에서 바로 데이터를 반환. (API 호출 최소화)
           * 데이터가 없으면: Yahoo Finance API를 통해 데이터를 가져와 DB에 저장한 후, 그 데이터를 반환.

   5. 백테스트 시뮬레이션 (Server):
       * `backtestService.js`는 getStockData를 통해 얻은 과거 데이터를 사용하여 시뮬레이션.
       * 시뮬레이션이 끝나면 calculatePerformance 함수를 호출하여 최종 자산, 수익률(CAGR), 최대 하락률(MDD) 등 주요 성능 지표를 계산.

   6. 결과 저장 및 응답 (Server → Client):
       * 계산된 백테스트 결과는 BacktestResult Mongoose 모델(server/models/BacktestResult.js)을 통해 MongoDB에 저장.
       * 저장된 결과는 다시 클라이언트(App.jsx)에게 HTTP 응답으로 전송.

   7. 결과 표시 (Client):
       * 클라이언트의 `App.jsx`는 서버로부터 받은 백테스트 결과를 상태(state)에 저장.
       * 이 데이터는 `BacktestResults` 컴포넌트를 통해 사용자에게 보기 쉽게 결과를 렌더링.


1.  **[Client]** React 앱이 사용자가 입력한 포트폴리오 정보(종목, 비중)와 기간 설정을 모아 JSON 객체를 만듬.
8.  **[Server → Client]** 계산된 모든 결과 데이터를 JSON 형태로 클라이언트에 응답으로 보냄.

## 3. 클라이언트 (`client/`) 상세 구조

```
client/

└── src/                      
    ├── App.jsx                     # 애플리케이션의 핵심 컴포넌트로, 전체 UI 흐름, 상태 관리, 백엔드 API 호출 로직을 포함
    ├── index.js                    # React 앱을 DOM에 마운트하는 진입점
    ├── components/           
    │   ├── BacktestResults.jsx     # 백테스트 결과 표시
    │   ├── PortfolioDetailModal.jsx# 포트폴리오 상세 모달
    │   └── RankingBoard.jsx        # 백테스트 랭킹 보드
    ├── data/                
    │   └── stocks.js                # 주식 종목 데이터 제공
    └── theme/                
        ├── themeStore.js           # Zustand를 사용한 # 테마(다크 모드 등) 관련 로직 및 상태 관리
        └── ThemeToggle.js          # 테마 변경 토글 UI 컴포넌트
```

## 4. 서버 (`server/`) 상세 구조

```
server/

├── server.js                 #Express 웹을 초기화하고, 미들웨어 설정, (MongoDB) 연결, API 라우트 등록 등 서버의 전반적인 설정을 담당하는 진입점
├── models/                   
│   ├── BacktestResult.js     # 백테스트 결과 모델
│   └── Stock.js              # 캐싱된 주식 데이터 모델
├── routes/                   
│   ├── backtest.js           # 백테스트 관련 라우트
│   └── stocks.js             # 주식 데이터 관련 라우트
└── services/                 
    ├── backtestService.js    # 백테스팅 시뮬레이션 및 계산 로직 (성과 지표, 연평균 수익률 등)
    └── stockService.js       # 주식 데이터 조회 및 MongoDB에 캐싱 로직으로 API 호출을 줄임
```

## 5 배포

프론트엔드 vercel 배포
https://stock-portfolio-backtest.vercel.app/
vercel 배포 주소 + render(초기 구동 콜드 스립 깨울 때만 느림)

(깃허브 커밋하면 자동으로 업데이트 후 자동 빌드 및 배포)

백엔드 render (초기 구동 느림,  장기 미사용시 서버를 깨워야해서, 무료 티어, 5분 콜드 슬립 있음)
깃 허브 코드를 바탕으로 커밋을 하게되면 자동으로 업데이트 배포
https://stock-portfolio-backtest.onrender.com
15분간 미사용시 콜드 슬립, 깨어나는데 30초정도 걸림

## 6 후기, 추가 사항
* 리액트 버전이 "^19.2.3"이라서 18버전을 넘어서 recoil을 사용할 수 없어서 zustand를 사용하여 다크모드 상태관리를 하였다

* 다크 모드를 초기 부터 고려해야 했었다 초기에 고려했다면 통일된 css와 간단한 :root 를 이용해 색상으로 바꾸었을 것이다

* 서버 부분에서 첫 모델 설계와 후기에 라우터 기능 설계과정에서 모델과 라우터가 합쳐지거나 필요 없어져, 수정하게됨, 초기 모델을 너무 세세하게 나누어 기능 중복이 된 것 같다

* 긴 기간으로 백테스트를 하다보면 금액이 미묘하게 다른 경우가 있는데, 그 경우는 병합에 의해서 주가 환산과정에서 소수점 자리수 인정부분 계산차이로 오차가 발생한다

* 포트폴리오 모델이 필요할 줄 알았는데 결과적으로 백테스트 모델에 편입됨

* 주식 목록을 일부만 클라이언트에 데이터 부분에 넣어두었는데 원래는 백엔드 서버 부분에 넣어서 웹 수정 배포없이 db에서 업데이트하고 변경하는 것이지만 간략화를 위해서 클라이언트 data에 입력했다 (서버 연결이 안될시 랜덤값으로 채워 모의 구현 기능이 있었다.)

* mongodb는 비관계형 db로 데이터 구조를 미리 정의할 필요 없어 저장 방식을 유연하게 중간에 변경할 수 있고, 대량의 데이터에 대한 빠른 읽기/쓰기 작업에 최적화지만 관계형 데이터 베이스에 비해 검색 정확도가 떨어질 수 있다
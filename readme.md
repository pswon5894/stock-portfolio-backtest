https://stock-portfolio-backtest.vercel.app/
vercel 배포 주소 + render(초기 구동 콜드 스립 깨울 때만 느림)
15분간 미사용시 콜드 슬립, 깨어나는데 30초정도 걸림

# 프로젝트 작동 방식 설명

이 프로젝트는 클라이언트-서버 아키텍처를 기반으로 한 주식 포트폴리오 백테스팅 웹. 사용자가 웹 인터페이스(클라이언트)를 통해 포트폴리오를 구성하면,
서버는 이 데이터를 받아 수익률을 계산하고 결과를 다시 클라이언트에 보여줍니다.

## 1. 전체 아키텍처

프로젝트 버전
"react": "^19.2.3"
node v24.12.0

-   **클라이언트**: [React]로 구축. 사용자가 포트폴리오를 구성하고 백테스트를 실행하며 그 결과를 확인할 수 있는 웹 인터페이스(UI)를 제공
-   **서버**: [Node.js]와 [Express] 프레임워크를 기반. 클라이언트로부터의 요청을 처리하는 RESTful API를 제공하고, 비즈니스 로직을 수행하며, 데이터베이스와 통신.
-   **데이터베이스**: [MongoDB]를 사용하여 데이터를 저장. 사용자가 생성한 포트폴리오와 외부 API에서 가져온 주식 데이터를 캐싱 및 저장
-   **외부 서비스**: [Yahoo Finance API](https://finance.yahoo.com/)를 통해 실제 주식 시장의 과거 데이터를 가져옵니다. `yahoo-finance2` 라이브러리를 사용하여 통신


## 2. 백엔드 (Server) 상세 설명

서버는 API 제공, 비즈니스 로직 처리, 데이터 관리를 담당

-   **`server.js`**: 서버의 메인 진입점. Express 앱을 설정하고, MongoDB 데이터베이스에 연결하며, API 라우터들을 등록

-   **`routes/`**: API 엔드포인트를 정의
    -   `portfolios.js`: 포트폴리오에 대한 CRUD(생성, 조회, 수정, 삭제) API를 제공
    -   `stocks.js`: 주식 종목을 검색하고 특정 종목의 과거 데이터를 조회하는 API를 제공
    -   `backtest.js`: 백테스트 실행을 요청하는 `POST /api/backtest/run` 엔드포인트를 정의합니다.

-   **`services/`**: 핵심 비즈니스 로직을 포함합니다.
    -   `stockService.js`: Yahoo Finance API와의 통신을 담당합니다. **데이터 캐싱 전략**이 구현되어 있어, 먼저 내부 MongoDB에 데이터가 있는지 확인하고, 없거나 오래된 경우에만 외부 API를 호출하여 데이터를 가져온 후 MongoDB에 저장(캐시)합니다. 이는 성능을 향상시키고 API 호출 횟수를 줄이는 중요한 역할을 합니다.
    -   `backtestService.js`: 실제 백테스트 시뮬레이션을 수행합니다. `stockService`를 통해 필요한 모든 주식 데이터를 가져온 후, "Buy and Hold" 투자 전략을 시뮬레이션

-   **`models/`**: MongoDB 데이터베이스의 스키마를 정의
    -   `Portfolio.js`: 사용자가 생성한 포트폴리오의 구조(이름, 보유 종목 및 비중 등)를 정의
    -   `Stock.js`: `stockService`가 캐싱할 주식 데이터의 구조를 정의
    -   `BacktestResult.js`: 백테스트 실행 결과를 저장하기 위한 스키마

## 3. 프론트엔드 (Client) 상세 설명

클라이언트는 사용자 경험(UX)을 만들고 서버와 상호작용합니다.

-   **`App.js`**: 애플리케이션의 메인 React 컴포넌트입니다. 전체 UI의 흐름을 단계별 마법사(Wizard) 형태로 관리
    1.  포트폴리오 이름/초기 자본 설정
    2.  포트폴리오에 포함할 주식 종목 선택
    3.  종목별 투자 비중 설정
    4.  백테스트 기간 설정 및 실행
    5.  결과 확인
-   **`components/`**: 재사용 가능한 UI 조각들입니다.
    -   `PortfolioBuilder.jsx`: 포트폴리오를 생성하고 편집하는 UI 컴포넌트
    -   `PortfolioList.jsx`: 저장된 포트폴리오 목록을 보여주는 컴포넌트
    -   `BacktestResults.jsx`: 백테스트 결과를 시각적으로 표현하는 컴포넌트
-   **`services/api.js`**: 서버 API와의 모든 통신을 중앙에서 관리하는 모듈 `axios` 라이브러리를 사용하여 백엔드에 HTTP 요청을 보내고 응답을 처리. 이를 통해 컴포넌트 코드와 API 호출 로직을 분리

## 4. 핵심 데이터 흐름: 백테스트 실행 과정

사용자가 "백테스트 실행" 버튼을 클릭했을 때의 데이터 흐름은 다음과 같습니다.

1.  **[Client]** React 앱이 사용자가 입력한 포트폴리오 정보(종목, 비중)와 기간 설정을 모아 JSON 객체를 만듭니다.
2.  **[Client → Server]** `services/api.js`를 통해 이 JSON 객체를 담아 서버의 `POST /api/backtest/run` 엔드포인트로 HTTP 요청을 보냅니다.
3.  **[Server]** `backtest.js` 라우터가 요청을 받아 `backtestService`의 `runBacktest` 함수를 호출합니다.
4.  **[Server]** `backtestService`는 포트폴리오에 포함된 모든 종목에 대해 `stockService`에게 과거 데이터를 요청합니다.
5.  **[Server/DB/API]** `stockService`는 각 종목에 대해 먼저 MongoDB 캐시를 확인합니다. 데이터가 있으면 즉시 반환하고, 없으면 Yahoo Finance API에 데이터를 요청하여 가져온 후 DB에 캐싱하고 반환합니다.
6.  **[Server]** `backtestService`는 모든 종목의 데이터를 받은 후, 포트폴리오 가치를 계산.
7.  **[Server]** 시뮬레이션 결과를 바탕으로 최종 수익률, MDD 등 다양한 성과 지표를 계산.
8.  **[Server → Client]** 계산된 모든 결과 데이터를 JSON 형태로 클라이언트에 응답으로 보냅니다.
9.  **[Client]** React 앱이 이 응답 데이터를 받아 상태(state)를 업데이트하고, `BacktestResults` 컴포넌트를 통해 사용자에게 보기 쉽게 결과를 렌더링합니다.


## 5 배포

프론트엔드 vercel 배포
https://stock-portfolio-backtest.vercel.app/
vercel 배포 주소 + render(초기 구동 콜드 스립 깨울 때만 느림)

(깃허브 커밋하면 자동으로 업데이트 후 자동 빌드 및 배포)

백엔드 render (초기 구동 느림,  장기 미사용시 서버를 깨워야해서, 무료 티어, 5분 콜드 슬립 있음)
깃 허브 코드를 바탕으로 커밋을 하게되면 자동으로 업데이트 배포
https://stock-portfolio-backtest.onrender.com
15분간 미사용시 콜드 슬립, 깨어나는데 30초정도 걸림

데이터 베이스 mongodb

## 6 후기, 추가 사항
다크 모드를 초기 부터 고려해야 했었다 초기에 고려했다면 통일된 css와 간단한 root 색상으로 바꾸었을 것이다

서버 부분에서 첫 모델 설계와 후기에 라우터 기능 설계과정에서 모델이 합쳐지거나 필요 없어지게되어 수정하게되었다, 초기 모델을 너무 세세하게 나눈것 같다

mongodb는 비관계형 db로 데이터 저장 방식을 유연하게 중간에 변경할 수 있고, 


  주요 기술 스택

   * 클라이언트 (Client):
       * React: 사용자 인터페이스(UI)를 구축하기 위한 JavaScript 라이브러리입니다.
       * Axios/Fetch: 서버와 HTTP 통신을 하기 위한 라이브러리입니다. (client/src/App.jsx 내에서 직접 fetch 사용)
   * 서버 (Server):
       * Node.js & Express: 서버를 구축하고 REST API를 만들기 위한 프레임워크입니다.
       * MongoDB & Mongoose: 백테스트 결과와 주식 데이터를 저장하기 위한 NoSQL 데이터베이스 및 ODM(Object Data Modeling) 라이브러리입니다.
   * api 데이터 소스:
       * Yahoo Finance API: stockService를 통해 주식의 과거 데이터를 가져오는 외부 API입니다.

  핵심 실행 흐름 (Core Execution Flow)

   1. 포트폴리오 구성 (Client):
       * 사용자는 client/src/App.jsx 컴포넌트를 통해 UI와 상호작용합니다.
       * 주식을 선택하고, 각 주식의 비중(가중치)과 백테스트 기간을 입력하여 포트폴리오를 구성합니다.

   2. 백테스트 요청 (Client → Server):
       * 사용자가 '백테스트 실행' 버튼을 클릭하면 App.jsx의 runBacktest 함수가 호출됩니다.
       * 이 함수는 구성된 포트폴리오 정보를 담아 서버의 POST /api/backtest/run 엔드포인트로 HTTP 요청을 보냅니다.

   3. API 요청 처리 (Server):
       * server/routes/backtest.js 라우터가 이 요청을 받아 backtestService.js의 runBacktest 함수를 호출합니다.

   4. 과거 데이터 조회 (Server):
       * backtestService는 stockService.js의 getStockData 함수를 호출하여 포트폴리오에 포함된 각 주식의 과거 데이터를 요청합니다.
       * 캐싱(Caching) 로직: stockService는 먼저 내부 MongoDB 데이터베이스(Stock 모델)에 해당 주식 데이터가 있는지 확인합니다.
           * 데이터가 있으면: DB에서 바로 데이터를 반환합니다. (API 호출 최소화)
           * 데이터가 없으면: Yahoo Finance API를 통해 데이터를 가져와 DB에 저장한 후, 그 데이터를 반환합니다.

   5. 백테스트 시뮬레이션 (Server):
       * backtestService.js는 getStockData를 통해 얻은 과거 데이터를 사용하여 simulateBuyAndHold (매수 후 보유) 전략을 시뮬레이션합니다.
       * 시뮬레이션이 끝나면 calculatePerformance 함수를 호출하여 최종 자산, 수익률(CAGR), 최대 하락률(MDD) 등 주요 성능 지표를 계산합니다.

   6. 결과 저장 및 응답 (Server → Client):
       * 계산된 백테스트 결과는 BacktestResult Mongoose 모델(server/models/BacktestResult.js)을 통해 MongoDB에 저장됩니다.
       * 저장된 결과는 다시 클라이언트(App.jsx)에게 HTTP 응답으로 전송됩니다.

   7. 결과 표시 (Client):
       * 클라이언트의 App.jsx는 서버로부터 받은 백테스트 결과를 상태(state)에 저장합니다.
       * 이 데이터는 BacktestResults.jsx 컴포넌트로 전달되어 사용자에게 테이블 형태로 시각화됩니다.

  주요 파일 및 디렉토리 역할

   * client/src/App.jsx: 클라이언트 애플리케이션의 메인 컴포넌트로, 전체 UI 흐름과 상태 관리를 담당합니다.
   * server/server.js: Node.js/Express 서버의 진입점. 미들웨어(CORS 등), DB 연결, 라우트 설정을 총괄합니다.
   * server/routes/backtest.js: 백테스트 및 랭킹 조회와 관련된 핵심 API 엔드포인트를 정의합니다.
   * server/services/backtestService.js: 핵심 비즈니스 로직이 담긴 곳. 실제 백테스팅 시뮬레이션과 성과 계산 알고리즘이 구현되어 있습니다.
   * server/services/stockService.js: 주식 데이터를 가져오는 역할을 하며, 외부 API 의존도를 줄이기 위한 캐싱 메커니즘을 구현한 중요한 파일입니다.
   * server/models/*.js: MongoDB에 저장될 데이터의 구조(Schema)를 정의합니다.


# stock-portfolio-backtest 프로젝트 폴더 구조 상세

이 문서는 `stock-portfolio-backtest` 프로젝트의 현재 폴더 구조와 각 구성 요소의 역할에 대해 상세히 설명합니다.

## 1. 개요

`stock-portfolio-backtest` 프로젝트는 React 프론트엔드와 Node.js/Express 백엔드로 구성된 풀스택 애플리케이션입니다. 사용자에게 주식 포트폴리오 백테스팅 기능을 제공하며, 과거 데이터를 기반으로 포트폴리오 성능을 분석합니다.

## 2. 프로젝트 최상위 구조

```
stock-portfolio-backtest/
├── README.md                 # 프로젝트에 대한 일반적인 정보
├── Zustand_Refactoring_Guide.md # Zustand 리팩토링 가이드 문서
├── .git/                     # Git 버전 관리 관련 파일
├── client/                   # React 기반 프론트엔드 애플리케이션
├── log/                      # 프로젝트 개발 과정에서 생성된 로그 및 문서 (다양한 가이드, 문제 해결 기록 등)
└── server/                   # Node.js/Express 기반 백엔드 애플리케이션
```

## 3. 클라이언트 (`client/`) 상세 구조

클라이언트 애플리케이션은 React를 사용하여 사용자 인터페이스를 구축합니다.

```
client/

└── src/                      
    ├── App.jsx               # 메인 애플리케이션 컴포넌트 (UI 흐름 및 상태 관리)
    ├── index.js              # React 애플리케이션의 시작점
    ├── components/           # 재사용 가능한 UI 컴포넌트
    │   ├── BacktestResults.jsx     # 백테스트 결과 표시
    │   ├── PortfolioBuilder.jsx    # 포트폴리오 구성 입력
    │   ├── PortfolioDetailModal.jsx# 포트폴리오 상세 모달
    │   └── RankingBoard.jsx        # 백테스트 랭킹 보드
    ├── data/                 # 정적 데이터 또는 목(mock) 데이터
    │   └── stocks.js         # 주식 관련 정적 데이터
    ├── services/             # 클라이언트 측 API 통신 로직
    │   └── api.js            # 백엔드 API와의 통신을 담당, 야후 파이넨스 api
    └── theme/                
        ├── themeStore.js       # Zustand를 사용한 # 테마(다크 모드 등) 관련 로직 및 상태 관리
        └── ThemeToggle.js      # 테마 변경 UI 컴포넌트
```

### 클라이언트 주요 파일 및 디렉토리 설명:

*   **`client/src/App.jsx`**: 애플리케이션의 핵심 컴포넌트로, 전체 UI 흐름, 상태 관리, 백엔드 API 호출 로직을 포함합니다.
*   **`client/src/index.js`**: React 앱을 DOM에 마운트하는 진입점입니다.
*   **`client/src/components/`**: 백테스트 결과를 표시하고, 포트폴리오를 구성하며, 랭킹을 보여주는 등 특정 기능을 수행하는 UI 컴포넌트들이 위치합니다.
*   **`client/src/data/stocks.js`**: 애플리케이션에서 사용되는 주식 관련 정적 데이터를 제공합니다.
*   **`client/src/services/api.js`**: 백엔드 API 엔드포인트와의 HTTP 통신을 캡슐화하여 클라이언트 코드에서 API 요청을 쉽게 할 수 있도록 합니다.
*   **`client/src/theme/`**: 애플리케이션의 시각적 테마(예: 다크/라이트 모드)와 관련된 Zustand 스토어 및 UI 토글 컴포넌트를 관리합니다.

## 4. 서버 (`server/`) 상세 구조

서버 애플리케이션은 Node.js와 Express를 사용하여 RESTful API를 제공하고 데이터베이스와 상호작용합니다.

```
server/

├── server.js                 # 백엔드 서버의 시작점
├── models/                   # MongoDB 데이터 스키마 (Mongoose)
│   ├── BacktestResult.js     # 백테스트 결과 모델
│   └── Stock.js              # 캐싱된 주식 데이터 모델
├── routes/                   # API 엔드포인트 정의
│   ├── backtest.js           # 백테스트 관련 API 라우트
│   └── stocks.js             # 주식 데이터 관련 API 라우트
└── services/                 # 핵심 비즈니스 로직 및 외부 서비스 연동
    ├── backtestService.js    # 백테스팅 시뮬레이션 및 계산 로직
    └── stockService.js       # 주식 데이터 조회 및 캐싱 로직
```

### 서버 주요 파일 및 디렉토리 설명:

*   **`server/server.js`**: Express 애플리케이션을 초기화하고, 미들웨어 설정, 데이터베이스(MongoDB) 연결, API 라우트 등록 등 서버의 전반적인 설정을 담당하는 진입점입니다.
*   **`server/models/`**: Mongoose 스키마를 사용하여 MongoDB 컬렉션의 데이터 구조를 정의합니다. `BacktestResult`는 백테스트 결과, `Portfolio`는 사용자 정의 포트폴리오, `Stock`은 캐싱된 주식 과거 데이터를 나타냅니다.
*   **`server/routes/`**: 클라이언트 요청을 처리하는 API 엔드포인트들을 정의합니다. `backtest.js`는 백테스트 실행 및 결과 조회, `portfolios.js`는 포트폴리오 관리, `stocks.js`는 주식 데이터 조회와 관련된 라우트를 담당합니다.
*   **`server/services/`**: 애플리케이션의 핵심 비즈니스 로직을 포함합니다.
    *   **`backtestService.js`**: 포트폴리오 백테스트 시뮬레이션 로직(예: Buy and Hold 전략)과 성과 지표(CAGR, MDD 등) 계산을 담당합니다.
    *   **`stockService.js`**: 주식 과거 데이터를 Yahoo Finance API에서 가져오고, MongoDB에 캐싱하는 로직을 구현하여 외부 API 호출을 최적화합니다.

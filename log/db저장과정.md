1단계: 클라이언트 (사용자 인터페이스)

  모든 것은 사용자가 웹 브라우저에서 포트폴리오 정보를 입력하고 버튼을 클릭하는 것에서 시작합니다.

   1. 데이터 입력: 사용자가 PortfolioBuilder 컴포넌트의 입력 필드에 포트폴리오 이름, 종목, 비중 등을
      입력합니다.
   2. API 요청:
       * "포트폴리오 저장" 버튼을 클릭하면, client/src/services/api.js 파일에 있는
         portfolioAPI.create(portfolioData) 함수가 호출됩니다.
       * "백테스트 실행" 버튼을 클릭하면, backtestAPI.run(backtestData) 함수가 호출됩니다.
   3. HTTP 통신: axios 라이브러리가 이 데이터를 가지고 Node.js 서버로 HTTP POST 요청을 보냅니다.
       * portfolioAPI.create는 http://localhost:5000/api/portfolios 주소로 요청을 보냅니다.
       * backtestAPI.run은 http://localhost:5000/api/backtest/run 주소로 요청을 보냅니다.

  ---

  2단계: 서버 (데이터 처리 및 저장 로직)

  클라이언트가 보낸 요청은 이제 Node.js 서버에 도착하여 처리됩니다.

  A. 포트폴리오 저장 (/api/portfolios 경로)

   1. 라우팅: Express 서버(server.js)는 /api/portfolios 요청을 routes/portfolios.js 파일로 안내합니다.
   2. 데이터 확인 (로그): 제가 추가한 아래 코드가 실행되어 서버 콘솔에 클라이언트가 보낸 데이터를
      그대로 출력합니다. 여기서 데이터가 서버에 잘 도착했는지, 내용은 올바른지 1차로 확인할 수
      있습니다.

   1     console.log('--- Creating New Portfolio ---');
   2     console.log('Request Body:', JSON.stringify(req.body, null, 2));
   3. Mongoose 모델 생성: const portfolio = new Portfolio(req.body); 코드가 실행됩니다. Mongoose는
      req.body로 받은 일반 JavaScript 객체를 Portfolio 모델 스키마에 정의된 형식의 데이터 객체로
      변환합니다.
   4. 데이터베이스에 저장: await portfolio.save(); 명령이 실행되는 가장 중요한 단계입니다.
       * 유효성 검사: Mongoose는 데이터를 저장하기 전에 Portfolio 스키마(models/Portfolio.js)에 정의된
         규칙(예: required: true, enum 등)에 맞는지 검사합니다. 데이터 형식이 맞지 않으면 여기서
         에러가 발생하고 catch 블록으로 이동합니다.
       * 명령 전송: 유효성 검사를 통과하면, Mongoose는 MongoDB가 이해할 수 있는 "document(문서) 삽입"
         명령으로 변환하여 MongoDB 데이터베이스로 전송합니다.
       * 저장 확인 (로그): 저장이 성공하면 제가 추가한 console.log('✅ Portfolio saved
         successfully!'); 로그가 서버 콘솔에 나타납니다. 만약 에러가 발생하면 console.error('❌ Error
         saving portfolio:', ...) 로그가 나타납니다.
   5. 응답: 서버는 저장된 데이터(MongoDB가 자동으로 생성한 고유 _id 포함)를 JSON 형태로 클라이언트에게
      다시 보내줍니다.

  B. 백테스트 결과 저장 (/api/backtest/run 경로)

   1. 라우팅: Express 서버는 /api/backtest/run 요청을 routes/backtest.js 파일로 안내합니다.
   2. 백테스트 실행: 먼저 backtestService.runBacktest() 함수가 실행되어 수익률, MDD 등 복잡한 계산을
      수행하고 결과 객체를 반환합니다.
   3. Mongoose 모델 생성: 계산이 완료된 결과와 클라이언트가 보낸 포트폴리오 설정을 합쳐 const
      savedResult = new BacktestResult({...}); 코드를 통해 BacktestResult 모델 객체를 생성합니다.
   4. 데이터 확인 (로그): DB에 저장하기 직전의 데이터 형태를 확인하기 위해 제가 추가한 아래 코드가
      서버 콘솔에 최종 데이터를 출력합니다. 스키마와 데이터가 일치하는지 비교하는 데 결정적인 단서가
      됩니다.

   1     console.log('--- Saving Backtest Result ---');
   2     console.log('Data to Save:', JSON.stringify(savedResult.toObject(), null, 2));
   5. 데이터베이스에 저장: await savedResult.save();가 실행됩니다. 포트폴리오 저장 과정과 마찬가지로
      Mongoose가 데이터 유효성을 검사하고 DB에 저장 명령을 내립니다.
   6. 응답: 서버는 백테스트 결과와 새로 생성된 _id를 클라이언트에게 응답으로 보냅니다.

  ---

  3단계: 데이터베이스 (영구 저장)

   1. 명령 수신: MongoDB Atlas 서버가 Node.js 서버로부터 "document 삽입" 명령을 받습니다.
   2. 저장: 서버는 받은 데이터를 portfolios 또는 backtestresults 컬렉션(Collection)에 새로운
      문서(Document)로 기록합니다.
   3. 완료: 이제 데이터는 영구적으로 저장되었으며, 나중에 find(), findById() 같은 명령을 통해 다시
      조회할 수 있습니다.

  결론

  "DB에 저장이 안 된다"는 것은 위 2단계, 특히 `await portfolio.save()` 또는 `await savedResult.save()`
  부분에서 문제가 발생했을 가능성이 매우 높습니다. 제가 추가한 console.log를 통해 서버가 받은 데이터와
  저장하려는 데이터의 내용을 직접 확인하면, 데이터의 형식이 스키마와 맞지 않아 발생하는 유효성 검사
  오류인지, 혹은 서버의 다른 로직 문제인지 원인을 특정할 수 있습니다.

  이제 서버를 재시작하고 기능을 실행했을 때 콘솔에 찍히는 로그를 확인해 보세요.
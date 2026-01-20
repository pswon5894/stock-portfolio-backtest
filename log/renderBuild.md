프로젝트가 루트 디렉터리에 client와 server를 함께 가지고 있는 모노레포(monorepo)
  형태이므로, Render가 어떤 디렉터리에서 어떤 명령을 실행해야 하는지 정확히 알려주어야
  합니다.

  Render의 서비스 생성 화면에서 아래와 같이 설정하시면 됩니다.

  ---

  Render 배포 설정

   1. Root Directory (루트 디렉터리)
       * 설정: server
       * 이유: 이 설정을 통해 Render는 프로젝트의 루트가 아닌 server 디렉터리 내에서
         빌드 및 시작 명령을 실행합니다. server 디렉터리 안에 백엔드 서버의
         package.json 파일이 있기 때문에 이 설정이 반드시 필요합니다.

   2. Build Command (빌드 명령)
       * 설정: npm install
       * 이유: 이 명령은 server 디렉터리의 package.json 파일을 읽어 express와 같은 서버
         운영에 필요한 모든 의존성 패키지들을 설치합니다.
       * 팁: npm install --production을 사용하면 devDependencies에 포함된 패키지들을
         제외하고 설치하여 용량을 줄이고 설치 속도를 높일 수 있습니다. (운영 환경에서는
         좋은 습관입니다.)

   3. Start Command (시작 명령)
       * 설정: npm start 또는 node server.js
       * 이유: 빌드가 완료된 후, 실제로 웹 서버를 실행하는 명령입니다.
         server/package.json의 scripts 안에 "start": "node server.js" 와 같이 정의된
         스크립트를 실행하는 npm start를 사용하는 것이 일반적이고 권장되는 방식입니다.

  ---

  요약 테이블


  ┌────────────────┬─────────────┬───────────────────────────────────────────┐
  │ 설정 항목       │ 값          │ 설명                                      │
  ├────────────────┼─────────────┼───────────────────────────────────────────┤
  │ Root Directory │ server      │ 명령을 실행할 기준 디렉터리를 지정합니다.       │
  │ Build Command  │ npm install │ 의존성 패키지를 설치합니다.                   │
  │ Start Command  │ npm start   │ 웹 서버를 실행합니다.                        │
  └────────────────┴─────────────┴───────────────────────────────────────────┘


  이 설정대로 진행하시면 Render가 성공적으로 Node.js 서버를 빌드하고 실행할 수 있을
  것입니다.
# 프로젝트 배포 안내서 (코드 수정 없음)

이 문서는 현재 코드베이스를 수정하지 않고 프론트엔드와 백엔드 서버를 프로덕션 환경에 배포하는 방법을 안내합니다.

이 가이드는 두 애플리케이션을 **별개의 프로세스**로 실행하는 것을 전제로 합니다.
-   **백엔드 서버**: API 요청을 처리하며 5000번 포트에서 실행됩니다.
-   **프론트엔드 서버**: 빌드된 React 정적 파일(HTML, CSS, JS)을 제공하며 3000번 포트에서 실행됩니다.

---

### 사전 준비 사항

-   **서버/호스팅 환경**: Ubuntu, CentOS 등 Linux를 실행하는 클라우드 서버 (예: AWS EC2, Google Cloud, Vultr).
-   **Node.js와 npm**: 서버에 Node.js(버전 14 이상 권장)와 npm이 설치되어 있어야 합니다.
-   **Git**: 서버에 Git이 설치되어 있어야 합니다.
-   **PM2**: Node.js 애플리케이션을 관리하기 위한 프로세스 매니저.

---

## 1단계: 백엔드 서버 배포 (`server`)

백엔드 API 서버를 설정하고 실행합니다.

### 1. 코드 가져오기

서버에 접속하여 프로젝트를 Git으로 클론합니다.

```bash
git clone <your-repository-url>
cd stock-portfolio-backtest/server
```

### 2. 프로덕션 환경 설정 (⚠️ 중요)

현재 코드는 `dev.js` 파일에서 직접 데이터베이스 연결 정보를 읽습니다. 프로덕션 환경에서는 이 파일을 직접 서버에 생성해야 합니다.

**`server/dev.js` 파일 생성:**

서버의 `server` 디렉토리 안에 `dev.js` 파일을 만들고 아래 내용을 채워넣으세요. `your_db_password` 부분을 실제 MongoDB Atlas 비밀번호로 교체해야 합니다.

```javascript
// server/dev.js
module.exports = {
  DB_USERNAME: "pswon5894_db_user",
  DB_PASSWORD: "<your_db_password>",
  DB_NAME: "stock-backtest"
};
```

**CORS 설정 확인 (⚠️ 매우 중요):**

`server/server.js` 파일에는 API를 호출할 수 있는 클라이언트의 주소가 `http://localhost:3000`으로 하드코딩되어 있습니다. **이 부분을 실제 프론트엔드 도메인으로 바꾸지 않으면 애플리케이션이 작동하지 않습니다.**

배포 후 프론트엔드에 접속할 도메인이 `http://www.my-stock-app.com`이라면, `server.js`의 `corsOptions`를 다음과 같이 직접 수정해야 합니다.

```javascript
// server/server.js 에서 수정해야 할 부분
const corsOptions = {
  origin: 'http://www.my-stock-app.com', // ⚠️ 이 부분을 실제 도메인으로 변경
  optionsSuccessStatus: 200
}
```

### 3. 의존성 설치

`npm`을 사용하여 프로덕션 의존성을 설치합니다.

```bash
npm install --production
```

### 4. 서버 실행 및 관리

`pm2`는 서버가 예기치 않게 종료되면 자동으로 재시작해주고, 백그라운드에서 계속 실행되도록 관리해주는 도구입니다.

```bash
# pm2를 전역으로 설치
npm install pm2 -g

# API 서버를 pm2로 실행
pm2 start server.js --name "stock-api"
```

-   **실행 확인**: `pm2 list` 또는 `pm2 logs stock-api` 명령으로 상태와 로그를 확인할 수 있습니다.
-   **서버 재부팅 시 자동 실행**: `pm2 startup` 명령을 실행하면 나타나는 안내에 따라 명령어를 복사/붙여넣기 하세요. 그 후 `pm2 save`를 실행하면 현재 프로세스가 저장됩니다.

이제 API 서버는 `http://<서버 IP 주소>:5000`에서 실행됩니다. 방화벽에서 **5000번 포트**가 열려 있는지 확인하세요.

---

## 2단계: 프론트엔드 서버 배포 (`client`)

빌드된 React 앱을 정적 파일 서버로 배포합니다.

### 1. API 주소 설정 (⚠️ 중요)

프론트엔드 코드는 API 서버 주소를 `http://localhost:5000`으로 하드코딩하고 있습니다. **이 부분을 실제 백엔드 서버의 공인 IP 주소 또는 도메인으로 변경해야 합니다.**

수정해야 할 파일은 2개입니다.
-   `client/src/App.js`
-   `client/src/services/api.js`

예를 들어, `client/src/services/api.js` 파일의 `API_BASE_URL`을 다음과 같이 수정해야 합니다.

```javascript
// client/src/services/api.js 에서 수정해야 할 부분
const API_BASE_URL = 'http://<백엔드 서버 IP 또는 도메인>:5000/api';
```
`App.js` 파일의 `fetch` 주소도 동일하게 수정해야 합니다.

### 2. 의존성 설치 및 앱 빌드

로컬 컴퓨터 또는 서버에서 `client` 디렉토리로 이동하여 빌드를 진행합니다.

```bash
cd stock-portfolio-backtest/client

# 의존성 설치
npm install

# 프로덕션용으로 빌드
npm run build
```

이 명령을 실행하면 `client/build` 디렉토리가 생성됩니다. 이 디렉토리 안에는 웹서버가 제공할 수 있는 정적인 HTML/CSS/JS 파일들이 들어있습니다.

### 3. 정적 파일 서버 실행

`build` 디렉토리의 내용을 서비스하기 위한 간단한 방법은 `serve` 패키지를 사용하는 것입니다.

```bash
# serve 패키지 전역 설치
npm install -g serve

# pm2를 이용해 정적 파일 서버 실행 (3000번 포트 사용)
pm2 start serve --name "stock-client" -- -s build -l 3000
```

-   `-s` 옵션은 모든 요청을 `index.html`로 보내 React Router가 작동하도록 합니다.
-   `-l 3000`은 3000번 포트에서 서버를 실행하라는 의미입니다.

이제 프론트엔드 서버는 `http://<서버 IP 주소>:3000`에서 실행됩니다. 방화벽에서 **3000번 포트**가 열려 있는지 확인하세요.

---

## 요약

1.  **백엔드 서버 준비**:
    -   `server/dev.js` 파일에 DB 접속 정보 입력.
    -   `server/server.js`의 `corsOptions`를 프론트엔드 도메인으로 수정.
    -   `pm2 start server.js --name "stock-api"`로 5000번 포트에서 실행.

2.  **프론트엔드 서버 준비**:
    -   `client` 소스코드의 API URL을 백엔드 서버 IP/도메인으로 수정.
    -   `npm run build`로 `build` 폴더 생성.
    -   `pm2 start serve --name "stock-client" -- -s build -l 3000`로 3000번 포트에서 실행.

모든 과정이 완료되면 사용자는 `http://<서버 IP 또는 도메인>:3000`으로 접속하여 애플리케이션을 사용할 수 있습니다.

# Cloudflare Tunnel을 이용한 백엔드 서버 배포 가이드

이 문서는 Cloudflare Tunnel을 사용하여 로컬에서 실행 중인 백엔드 서버를 안전하게 외부 인터넷에 배포하는 방법을 안내합니다. 이 방법을 사용하면 별도의 공인 IP나 복잡한 방화벽 설정 없이도 서버를 안정적으로 운영할 수 있습니다.

## 전제 조건

1.  **Cloudflare 계정**: Cloudflare 계정이 필요합니다. 없다면 [여기](https://dash.cloudflare.com/sign-up)에서 생성하세요.
2.  **도메인**: Cloudflare에 등록된 개인 도메인이 필요합니다.
3.  **실행 중인 백엔드 서버**: 배포하려는 백엔드 서버가 로컬 환경에서 특정 포트(예: `5000`번 포트)로 실행되고 있어야 합니다.

---


## 배포 절차

### 1단계: `cloudflared` 설치

`cloudflared`는 Cloudflare Tunnel을 관리하기 위한 커맨드 라인 도구입니다.

-   **Windows**: [여기](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/)에서 최신 버전을 다운로드하고, 환경 변수 `PATH`에 `cloudflared.exe`의 경로를 추가하여 어느 위치에서든 실행할 수 있도록 설정합니다.
-   **macOS**: `brew install cloudflare/cloudflare/cloudflared` 명령어로 설치합니다.
-   **Linux**: 배포판에 맞는 설치 방법은 공식 문서를 참고하세요.

### 2단계: `cloudflared` 인증

설치한 `cloudflared`를 Cloudflare 계정과 연결합니다. 아래 명령어를 실행하면 브라우저 창이 열리며, 로그인하여 사용할 도메인을 선택하라는 메시지가 나타납니다.

```bash
cloudflared tunnel login
```

인증이 완료되면 `cert.pem` 파일이 생성되며, 이후의 작업이 해당 계정으로 수행됩니다.

### 3단계: 터널 생성

백엔드 서비스를 위한 고유한 터널을 생성합니다. `<TUNNEL_NAME>` 부분에 원하는 터널 이름을 지정하세요 (예: `my-backend-tunnel`).

```bash
cloudflared tunnel create <TUNNEL_NAME>
```

명령어를 실행하면 터널의 **UUID**와 함께 JSON 형식의 자격 증명 파일 경로가 출력됩니다. **UUID** 값은 다음 단계에서 사용되니 잘 기록해두세요.

### 4단계: 터널 구성 파일 작성

`cloudflared`가 터널을 어떻게 운영할지 설정하는 구성 파일을 작성해야 합니다.

1.  `cloudflared`의 기본 설정 디렉터리로 이동합니다.
    -   Windows: `C:\Users\<사용자이름>\.cloudflared\`
    -   macOS/Linux: `~/.cloudflared/`

2.  해당 디렉터리에 `config.yml` 파일을 생성하고 아래 내용을 작성합니다.

    ```yaml
    # 터널의 UUID를 여기에 입력하세요.
    tunnel: <3단계에서-받은-UUID>
    # 3단계에서 생성된 자격 증명 파일의 경로를 입력하세요.
    credentials-file: C:\Users\<사용자이름>\.cloudflared\<UUID>.json

    # 수신(Ingress) 규칙 설정
    ingress:
      # 이 터널을 통해 공개할 첫 번째 서비스의 호스트 이름을 지정합니다.
      # 이 주소로 접속하면 로컬 서버로 연결됩니다.
      - hostname: api.your-domain.com # 실제 사용하는 도메인으로 변경하세요.
        # 로컬에서 실행 중인 백엔드 서버의 주소와 포트를 입력합니다.
        # 만약 서버가 3001번 포트에서 실행 중이라면 service: http://localhost:3001 로 변경하세요.
        service: http://localhost:5000

      # 모든 규칙과 일치하지 않는 요청은 404 에러를 반환합니다.
      # 이 규칙은 항상 마지막에 위치해야 합니다.
      - service: http_status:404
    ```

    **[중요]**
    -   `<3단계에서-받은-UUID>`와 자격 증명 파일 경로를 자신의 환경에 맞게 수정하세요.
    -   `hostname`을 Cloudflare에 등록한 실제 도메인(또는 서브도메인)으로 변경하세요.
    -   `service`의 포트 번호를 현재 프로젝트의 백엔드 서버가 사용하는 포트 번호로 정확하게 수정해야 합니다. (예: `http://localhost:5000`)

### 5단계: DNS 레코드 생성

구성 파일에 설정한 호스트 이름(`hostname`)을 방금 생성한 터널로 연결하는 DNS 레코드를 생성합니다.

```bash
cloudflared tunnel route dns <TUNNEL_NAME> <HOSTNAME>
```

-   `<TUNNEL_NAME>`: 3단계에서 지정한 터널 이름
-   `<HOSTNAME>`: `config.yml`에 작성한 호스트 이름 (예: `api.your-domain.com`)

### 6단계: 터널 실행

이제 터널을 실행하여 로컬 서버를 외부와 연결합니다.

```bash
cloudflared tunnel run <TUNNEL_NAME>
```

터미널에 Cloudflare 네트워크와의 연결 상태가 로그로 출력됩니다. 이 터미널 창이 활성화되어 있는 동안에만 터널이 유지됩니다.

## 확인

1.  터미널 로그에 에러 없이 정상적으로 연결되었다는 메시지가 뜨는지 확인합니다.
2.  웹 브라우저나 Postman과 같은 API 테스트 도구를 사용하여 `config.yml`에 설정한 `hostname`(예: `https://api.your-domain.com`)으로 접속하여 백엔드 서버가 응답하는지 확인합니다.

## 다음 단계 (선택 사항)

### 터널을 서비스로 실행하기

매번 `cloudflared tunnel run` 명령어를 실행하는 대신, 시스템 서비스로 등록하여 컴퓨터가 시작될 때마다 터널이 자동으로 실행되게 할 수 있습니다.

```bash
# 서비스 설치 (관리자 권한으로 실행)
cloudflared service install

# 서비스 시작
cloudflared service start
```

### CORS 설정

프론트엔드(`client`)와 백엔드(`server`)의 도메인이 다르기 때문에 **CORS(Cross-Origin Resource Sharing)** 오류가 발생할 수 있습니다. 백엔드 서버(예: `server.js`)에 `cors` 미들웨어를 추가하여 프론트엔드 도메인에서의 요청을 허용해야 합니다.

**예시 (Express.js와 `cors` 패키지 사용):**

```javascript
const cors = require('cors');
const express = require('express');

const app = express();

// 프론트엔드 애플리케이션의 주소를 허용합니다.
const corsOptions = {
  origin: 'https://your-frontend-domain.com', // 실제 프론트엔드 배포 주소
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// ... 이하 라우트 및 서버 설정
```

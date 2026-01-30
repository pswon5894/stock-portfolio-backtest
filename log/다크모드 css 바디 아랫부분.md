문제
바디 아랫부분 다크모드 적용안됨

.app.dark {
  background-color: #121212;
  color: white;
  min-height: 100vh;
}

해결
  min-height: 100vh;

  이거 안했다고 바닥이 검정색으로 안칠해지더라
    viewport height, 보이는 화면 가득찬 높이로


.App {
  min-height: 100vh;
  background: linear-gradient(135deg, #0066CC 0%, #0047AB 100%);
}

이것은 전체가 파란색, 최소 높아 덕분인듯
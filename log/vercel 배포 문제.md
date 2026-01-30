Error message
Treating warnings as errors because process.env.CI = true.
Failed to compile

위 메시지를 해석하면 process.env.CI = true 이기 때문에 warning을 error로 간주한다는 의미

 creat-react-app build 시 나타날 수 있는 에러로, React는 warning을 build 에러로 처리하기 때문

 발생 원인
ESLint를 적용하면서 warn으로 설정한 규칙이 있었고, warning 상태인 코드들을 수정하지 않은 채 build를 했더니 에러가 발생

해결 방법
에러 메시지에서 process.env.CI = true 이므로 warning을 error로 간주한다고 알려주었기 때문에 CI를 false 처리

"scripts": {
  "start": "react-scripts start",
  "build": "CI=false react-scripts build", // && 연산자 없어도 정상적으로 실행
  "test": "react-scripts test",
},
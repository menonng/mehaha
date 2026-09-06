# mehaha

친구를 놀라게 하기 위한 장난용 GitHub Pages 사이트입니다. TypeScript로 작성되었습니다.

## 동작 방식

1. 방문자는 1~10 사이의 숫자를 맞추는 간단한 게임을 봅니다.
2. 숫자를 틀리면 방문자의 운영체제(Windows / macOS / Linux)를 추정해, 그에 맞는
   모습의 새 창(팝업)을 띄웁니다. 이 창은 실제 터미널이 아니라 CSS와 텍스트로
   구현한 연출이며, Windows 명령 프롬프트 · macOS 터미널 · Linux 터미널의
   겉모습을 흉내 냅니다.
3. 연출이 끝나면 창에 "실제로는 어떤 명령도 실행되지 않았고, 장치의 파일이나
   데이터는 전혀 변경되지 않았다"는 문구가 명시적으로 표시됩니다.

**이 사이트는 실제로 어떤 파일도 읽거나 쓰거나 삭제하지 않습니다.** 웹 브라우저는
애초에 그런 권한을 페이지에 주지 않으며, 이 코드도 그런 시도를 하지 않습니다.
화면에 보이는 `del`/`rm -rf` 같은 명령 텍스트는 전부 문자열로 출력만 되는
연출용 문구입니다.

## 로컬에서 빌드하기

```bash
npm install
npm run build   # src/*.ts -> dist/*.js
```

`index.html`을 정적 서버로 열면 됩니다 (예: `npx serve .`).

## 배포

`main` 브랜치에 푸시하면 `.github/workflows/deploy.yml`이 TypeScript를 빌드해
GitHub Pages로 배포합니다. 저장소 설정에서 **Settings → Pages → Build and
deployment → Source**를 `GitHub Actions`로 지정해야 합니다.

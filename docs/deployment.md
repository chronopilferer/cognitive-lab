# GitHub Pages 배포

1. 사용자 계정에 빈 공개 저장소 `cognitive-lab` 생성. 동명 저장소가 있으면 덮어쓰지 않고 먼저 확인.
2. 소스 폴더에서 Git 초기화 후 main 브랜치를 push.
3. Settings → Pages → Source를 GitHub Actions로 선택.
4. `.github/workflows/pages.yml` 성공 확인.
5. `https://chronopilferer.github.io/cognitive-lab/`에서 첫 화면·HashRouter·훈련·저장·새로고침을 확인. 이 주소는 **예상 주소이며 현재 배포 확인된 URL이 아닙니다.**

```bash
git init -b main
git add .
git commit -m "Build Cognitive Lab training platform"
git remote add origin https://github.com/chronopilferer/cognitive-lab.git
git push -u origin main
```

이미 Git이 초기화된 소스에서 위 명령을 그대로 반복하지 말고 현재 원격과 브랜치를 확인하세요. 전달 ZIP은 별도 호스팅 식별자·토큰·node_modules·QA 파일을 포함하지 않습니다.

Node 22 / npm ci → lint → typecheck → Vitest → production build → Playwright(Chromium desktop/mobile) → Pages 업로드·배포. PR에서는 검증만 합니다. contents:read는 build, pages:write와 id-token:write는 deploy job에만 부여합니다.

정적 호스트의 base는 상대 경로입니다. GitHub Actions 환경에서는 `/cognitive-lab/`를 사용합니다. E2E dev 서버에서는 base를 루트로 재설정합니다. 서버 fallback 없이 해시 라우팅으로 새로고침합니다.

참고: https://vite.dev/guide/static-deploy

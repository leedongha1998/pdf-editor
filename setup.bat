@echo off
echo === PDF 편집기 프로젝트 설정 ===
echo.

echo [1/4] npm 패키지 설치 중...
npm install
if %errorlevel% neq 0 ( echo npm install 실패 & pause & exit /b 1 )

echo [2/4] Git 초기화 중...
git init
git checkout -b main
git commit --allow-empty -m "chore: initial empty commit"

echo [3/4] feature 브랜치 생성 및 코드 커밋...
git checkout -b feature/pdf-editor
git add .
git commit -m "feat: PDF 변환 및 편집 웹 앱 구현

- PDF 뷰어: pdfjs-dist 기반 캔버스 렌더링 (줌/페이지 이동)
- 페이지 편집: 회전(좌/우 90도), 페이지 삭제, 썸네일 사이드바
- PDF 병합: 여러 PDF를 순서 지정 후 하나로 합치기
- PDF 분할: 원하는 페이지만 추출하여 새 PDF 생성
- 이미지 변환: JPG/PNG를 PDF로 변환"

echo [4/4] GitHub 저장소 생성 및 PR 생성...
gh repo create pdf-editor --public --source=. --remote=origin --push
git push origin feature/pdf-editor
gh pr create --title "feat: PDF 변환 및 편집 웹 앱 구현" --body "## 변경 요약

### 주요 기능
- **PDF 편집기**: PDF 파일 열기, 페이지 보기(줌/이동), 회전, 페이지 삭제
- **PDF 병합**: 여러 PDF 파일을 순서 지정 후 하나로 병합 다운로드
- **PDF 분할**: 원하는 페이지만 선택하여 새 PDF로 추출
- **이미지 변환**: JPG/PNG 이미지를 PDF로 변환

### 기술 스택
- React 18 + TypeScript + Vite
- pdf-lib: PDF 생성/편집/병합/분할
- pdfjs-dist: PDF 캔버스 렌더링
- Tailwind CSS: UI 스타일링
- react-dropzone: 파일 업로드

## 개발 서버 실행
\`\`\`bash
npm install
npm run dev
\`\`\`"

echo.
echo 완료! PR URL을 확인하세요.
pause

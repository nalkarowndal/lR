# React + TypeScript + Vite

## LuxuryRental 테마 교체

- 스플래시 엠블럼은 `src/theme/splash-art.svg`에서 교체합니다. Vite가 같은 원본을 초기 HTML에 삽입하고 React에서도 사용합니다. 프레임과 워드마크 스타일은 `src/theme/splash.css`에서 조정합니다.
- 화면 아이콘은 `src/components/icons/ThemeIcon.tsx`에 연결합니다. 예를 들어 검색 모양은 `search`에 연결된 컴포넌트를 바꾸면 홈·검색·판매·관리자 화면에 함께 적용됩니다. 라인 색상은 `src/theme/icons.css`, 각인 효과는 `src/components/icons/EngravedIconTokens.tsx`에서 조정합니다.
- `npm.cmd run build`로 배포 파일을 생성합니다. `node --test tests/*.test.mjs`로 회귀 검사를, `node scripts/verify-theme.mjs`로 Chromium의 스플래시 전환과 하단바 동작을 확인할 수 있습니다. Chromium이 기본 경로에 없으면 `CHROME_PATH`에 실행 파일을 지정합니다.

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend enabling type-aware lint rules by installing `oxlint-tsgolint` and editing `.oxlintrc.json`:

```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "plugins": ["react", "typescript", "oxc"],
  "options": {
    "typeAware": true
  },
  "rules": {
    "react/rules-of-hooks": "error",
    "react/only-export-components": ["warn", { "allowConstantExport": true }]
  }
}
```

See the [Oxlint rules documentation](https://oxc.rs/docs/guide/usage/linter/rules) for the full list of rules and categories.

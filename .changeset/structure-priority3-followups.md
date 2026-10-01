---
"@gugbab/hooks": patch
"@gugbab/headless": patch
"@gugbab/styled-mui": patch
"@gugbab/styled-radix": patch
---

peer 범위 명시: `react`·`react-dom` peer를 `>=18`에서 `^18.0.0 || ^19.0.0`으로 좁혔습니다. 검증되지 않은 미래 major(React 20 등)가 자동으로 허용되지 않습니다. React 18·19 사용자에게는 변화가 없습니다. React 20 이상이나 canary를 쓰면 설치 시 peer 경고(엄격 모드에서는 오류)가 날 수 있습니다. 새 major는 지원을 검증한 뒤 범위를 넓힙니다.

---
"@gugbab/styled-mui": patch
"@gugbab/styled-radix": patch
---

내부 구조 정리: 두 스타일 패키지가 똑같이 들고 있던 컴포넌트 래퍼 코드를 비공개 워크스페이스 패키지(`@gugbab/styled-factory`)의 접두사 팩토리로 합쳤습니다. 빌드할 때 각 패키지 번들에 포함되므로 설치할 의존성은 늘지 않습니다. 렌더링 마크업·export 이름·타입·`styles.css`는 바뀌지 않습니다(마크업 스냅샷과 타입 동일성 검사로 확인).

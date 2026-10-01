# @gugbab/styled-factory (private)

`@gugbab/styled-mui`과 `@gugbab/styled-radix`가 공유하는 컴포넌트 래퍼 팩토리입니다. **npm에 배포하지 않습니다.**

- 각 컴포넌트는 `create<Name>(prefix)`로 만듭니다. 예: `createSwitch("gmui")`는 `gmui-switch`·`gmui-switch--md` 같은 클래스를 붙인 compound 컴포넌트를 반환합니다.
- 패키지 사이 차이는 접두사와 `createTabs(prefix, { defaultVariant })`의 기본 variant뿐입니다.
- 스타일 패키지의 tsup은 `noExternal`로 이 소스를 번들에 포함하고, `dts`의 `paths`로 타입도 인라인합니다. 배포된 결과물(`dist/*.d.ts`, `*.mjs`, `*.cjs`)은 이 패키지를 참조하지 않습니다. 각 스타일 패키지의 `build`가 마지막에 `scripts/assert-no-private-imports.mjs`로 이를 검사하고, 참조가 남으면 빌드를 실패시킵니다.
- `"private": true`를 지우지 마세요. 의존성은 `devDependencies`에만 둡니다(배포를 전제로 한 `workspace:*` peer가 없습니다).
- 래퍼를 고칠 때는 여기서 한 번만 고칩니다. 각 스타일 패키지의 `markup-parity` 스냅샷은 요소 구조와 클래스 이름을 고정하므로, 의도한 클래스 변경일 때만 갱신합니다.

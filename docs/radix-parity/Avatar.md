# Avatar — Radix 1:1 parity

> 비교 시점: 2026-04-27 / Radix HEAD

## 격차 항목
- [ ] **Image 로딩 메커니즘**: Radix는 `new window.Image()`로 preload 후 status 추적, `loaded`일 때만 실제 `<img>` 렌더. 우리는 `<img>`를 항상 렌더하고 `display:none`으로 숨김. UX·SSR 동작 다름.
- [ ] **referrerPolicy / crossOrigin 처리**: Radix는 hook 내부에서 image 객체에 직접 적용. 우리는 props로만 전달.
- [ ] **AvatarImage가 loaded 시에만 마운트**: Radix는 `imageLoadingStatus === 'loaded' ? <img/> : null`. 우리는 항상 마운트.
- [ ] **`onLoadingStatusChange` callback prop on Image**: Radix는 image 자체에 status 변화 알림 콜백 제공. 우리는 없음.
- [ ] **AvatarFallback `delayMs` 비교**: Radix는 `delayMs === undefined ? canRender=true 즉시 : timer`. 우리도 동일하지만 src 변경 시 처리 약간 다름.
- [ ] **`data-state` on Root**: 우리는 imageLoadStatus를 data-state로 노출. Radix는 안 함. → 우리가 더 풍부 (유지 OK), 또는 제거해서 매칭.

### 우리에게 있고 Radix에 없는 것
- `data-state` on Root → 풍부함, 유지 OK

## 구현 방향
Radix 메커니즘으로 전환:
- `useImageLoadingStatus` 훅 추가 (window.Image 기반)
- AvatarImage가 `loaded`일 때만 렌더 (절대 `display:none` 트릭 안 씀)
- referrerPolicy/crossOrigin 처리
- `onLoadingStatusChange` prop
- `data-state` on Root는 유지 (확장 호환)

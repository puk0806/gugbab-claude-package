export * from './forms';
export * from './navigation';
export * from './overlays';
export * from './primitives';
// `shared/*` are advanced internal primitives (DismissableLayer, FocusScope,
// RovingFocusGroup, Collection, Presence, DirectionProvider, usePresence) that
// the styled wrappers and stateful components compose internally. They are
// exported here so power users can fork-and-extend behavior, but their API
// stability is *not* guaranteed across major versions — treat as advanced /
// experimental until graduated to a stable Advanced API or moved to a subpath.
// TODO(v2): Decide between (a) documenting as stable Advanced API or (b)
// migrating to `@gugbab/headless/internal` subpath export.
export * from './shared';
export * from './stateful';

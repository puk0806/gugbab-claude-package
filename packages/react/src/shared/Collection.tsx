import {
  createContext,
  type ReactNode,
  type Ref,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react';

interface CollectionItemRecord<T = unknown> {
  id: string;
  ref: { current: HTMLElement | null };
  data?: T;
}

export interface CollectionItemEntry<T = unknown> {
  id: string;
  ref: { current: HTMLElement | null };
  data?: T;
  /** DOM-order index. */
  index: number;
}

interface CollectionContextValue {
  register: (record: CollectionItemRecord<unknown>) => () => void;
  /** DOM-order entries. Recomputed each call. */
  getEntries: <T>() => Array<CollectionItemEntry<T>>;
  /** Bumps when items change so consumers can re-derive. */
  version: number;
}

const CollectionContext = createContext<CollectionContextValue | null>(null);

export interface CollectionProps {
  children?: ReactNode;
}

/**
 * Provides a context that tracks descendant items in DOM order. Children
 * register via `useCollectionItem`, and consumers read the ordered list via
 * `useCollectionItems`. Useful for menus, listboxes, and any widget that
 * needs typeahead or index-aware navigation.
 */
export function Collection({ children }: CollectionProps) {
  const itemsRef = useRef<Map<string, CollectionItemRecord<unknown>>>(new Map());
  const [version, setVersion] = useState(0);
  const bump = useCallback(() => setVersion((v) => v + 1), []);

  const register = useCallback<CollectionContextValue['register']>(
    (record) => {
      itemsRef.current.set(record.id, record);
      bump();
      return () => {
        itemsRef.current.delete(record.id);
        bump();
      };
    },
    [bump],
  );

  const getEntries = useCallback(<T,>(): Array<CollectionItemEntry<T>> => {
    const all = Array.from(itemsRef.current.values()) as Array<CollectionItemRecord<T>>;
    const sorted = all.sort((a, b) => {
      const aNode = a.ref.current;
      const bNode = b.ref.current;
      if (!aNode || !bNode) return 0;
      const pos = aNode.compareDocumentPosition(bNode);
      if (pos & Node.DOCUMENT_POSITION_FOLLOWING) return -1;
      if (pos & Node.DOCUMENT_POSITION_PRECEDING) return 1;
      return 0;
    });
    return sorted.map((record, index) => ({ ...record, index }));
  }, []);

  const value = useMemo<CollectionContextValue>(
    () => ({ register, getEntries, version }),
    [register, getEntries, version],
  );

  return <CollectionContext.Provider value={value}>{children}</CollectionContext.Provider>;
}

function useCollectionContext(): CollectionContextValue {
  const ctx = useContext(CollectionContext);
  if (!ctx) {
    throw new Error('Collection hooks must be used inside <Collection>');
  }
  return ctx;
}

export interface UseCollectionItemOptions<T> {
  data?: T;
  id?: string;
}

export interface UseCollectionItemResult {
  ref: Ref<HTMLElement>;
  /** Live DOM-order index. Re-rendered when the collection changes. */
  index: number;
}

/**
 * Registers an element with the parent <Collection> and reports its current
 * DOM-order index. Spread the returned ref onto the element to track.
 */
export function useCollectionItem<T = unknown>(
  options: UseCollectionItemOptions<T> = {},
): UseCollectionItemResult {
  const ctx = useCollectionContext();
  const generatedId = useId();
  const id = options.id ?? generatedId;
  const ref = useRef<HTMLElement | null>(null);

  // Keep the latest data accessible to siblings without re-registering.
  const dataRef = useRef<T | undefined>(options.data);
  dataRef.current = options.data;

  // biome-ignore lint/correctness/useExhaustiveDependencies: register once on mount
  useEffect(() => {
    return ctx.register({
      id,
      ref,
      get data() {
        return dataRef.current;
      },
    } as CollectionItemRecord<unknown>);
  }, [id]);

  // Compute index live each render via DOM-order sort.
  // ctx.version forces re-render on collection changes.
  const index = useMemo(() => {
    const node = ref.current;
    if (!node) return -1;
    const entries = ctx.getEntries<unknown>();
    return entries.findIndex((e) => e.id === id);
  }, [ctx, id]);

  return { ref: ref as Ref<HTMLElement>, index };
}

/**
 * Returns a getter that produces the current DOM-order entries of the parent
 * <Collection>. Call from event handlers or layout effects (post-commit) to
 * read up-to-date positions — reading during render returns pre-commit order.
 */
export function useCollection<T = unknown>(): () => Array<CollectionItemEntry<T>> {
  const ctx = useCollectionContext();
  return useCallback(() => ctx.getEntries<T>(), [ctx]);
}

/**
 * Returns a snapshot of all descendants in DOM order. Suitable for render-time
 * use when the snapshot is taken from a layout effect or event-driven update.
 * For event handlers, prefer `useCollection()` to call lazily on demand.
 */
export function useCollectionItems<T = unknown>(): Array<CollectionItemEntry<T>> {
  const ctx = useCollectionContext();
  return ctx.getEntries<T>();
}

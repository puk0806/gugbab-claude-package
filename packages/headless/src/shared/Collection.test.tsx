import { render, screen } from '@testing-library/react';
import { useLayoutEffect } from 'react';
import { describe, expect, it } from 'vitest';
import { Collection, useCollection, useCollectionItem, useCollectionItems } from './Collection';

interface ItemData {
  value: string;
  disabled?: boolean;
}

function Item({
  value,
  disabled,
  children,
}: {
  value: string;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  const { ref } = useCollectionItem<ItemData>({ data: { value, disabled } });
  return (
    <button type="button" ref={ref as React.Ref<HTMLButtonElement>} data-testid={`item-${value}`}>
      {children}
    </button>
  );
}

function Probe({
  children,
}: {
  children: (items: ReturnType<typeof useCollectionItems<ItemData>>) => React.ReactNode;
}) {
  const items = useCollectionItems<ItemData>();
  return <>{children(items)}</>;
}

describe('Collection — render', () => {
  it('renders children inside the provider', () => {
    render(
      <Collection>
        <Item value="a">a</Item>
        <Item value="b">b</Item>
      </Collection>,
    );
    expect(screen.getByTestId('item-a')).toBeInTheDocument();
    expect(screen.getByTestId('item-b')).toBeInTheDocument();
  });
});

describe('Collection — DOM-order tracking', () => {
  it('useCollectionItems returns items in DOM order', () => {
    let captured: ReturnType<typeof useCollectionItems<ItemData>> = [];
    render(
      <Collection>
        <Item value="a">a</Item>
        <Item value="b">b</Item>
        <Item value="c">c</Item>
        <Probe>
          {(items) => {
            captured = items;
            return null;
          }}
        </Probe>
      </Collection>,
    );
    const values = captured.map((item) => item.data?.value);
    expect(values).toEqual(['a', 'b', 'c']);
  });

  it('reordering children updates DOM-order (read post-commit via useCollection)', () => {
    let captured: ReturnType<typeof useCollectionItems<ItemData>> = [];

    function PostCommitProbe() {
      const get = useCollection<ItemData>();
      useLayoutEffect(() => {
        captured = get();
      });
      return null;
    }

    function Tree({ reverse }: { reverse: boolean }) {
      const items = ['a', 'b', 'c'];
      const ordered = reverse ? [...items].reverse() : items;
      return (
        <Collection>
          {ordered.map((v) => (
            <Item key={v} value={v}>
              {v}
            </Item>
          ))}
          <PostCommitProbe />
        </Collection>
      );
    }

    const { rerender } = render(<Tree reverse={false} />);
    expect(captured.map((i) => i.data?.value)).toEqual(['a', 'b', 'c']);
    rerender(<Tree reverse={true} />);
    expect(captured.map((i) => i.data?.value)).toEqual(['c', 'b', 'a']);
  });

  it('preserves arbitrary item data', () => {
    let captured: ReturnType<typeof useCollectionItems<ItemData>> = [];
    render(
      <Collection>
        <Item value="a" disabled>
          a
        </Item>
        <Item value="b">b</Item>
        <Probe>
          {(items) => {
            captured = items;
            return null;
          }}
        </Probe>
      </Collection>,
    );
    expect(captured[0]?.data?.disabled).toBe(true);
    expect(captured[1]?.data?.disabled).toBeUndefined();
  });
});

describe('Collection — index reporting', () => {
  it('useCollectionItem reports the DOM-order index', () => {
    const indices: Array<{ value: string; index: number }> = [];

    function ItemProbe({ value }: { value: string }) {
      const { ref, index } = useCollectionItem<ItemData>({ data: { value } });
      indices.push({ value, index });
      return (
        <button type="button" ref={ref as React.Ref<HTMLButtonElement>}>
          {value}
        </button>
      );
    }

    render(
      <Collection>
        <ItemProbe value="a" />
        <ItemProbe value="b" />
        <ItemProbe value="c" />
      </Collection>,
    );

    // After mount, find the most recent reported index for each value.
    const lastIndex = (v: string) => {
      const last = [...indices].reverse().find((i) => i.value === v);
      return last?.index;
    };
    expect(lastIndex('a')).toBe(0);
    expect(lastIndex('b')).toBe(1);
    expect(lastIndex('c')).toBe(2);
  });
});

describe('Collection — out-of-context safety', () => {
  it('useCollectionItem throws when used outside Collection', () => {
    function OrphanItem() {
      useCollectionItem<ItemData>({ data: { value: 'x' } });
      return null;
    }
    expect(() => render(<OrphanItem />)).toThrow();
  });

  it('useCollectionItems throws when used outside Collection', () => {
    function Orphan() {
      useCollectionItems<ItemData>();
      return null;
    }
    expect(() => render(<Orphan />)).toThrow();
  });
});

import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Accordion } from './Accordion';

function One({ level }: { level?: 1 | 2 | 3 | 4 | 5 | 6 }) {
  return (
    <Accordion.Root type="single">
      <Accordion.Item value="a">
        <Accordion.Header level={level}>
          <Accordion.Trigger>A</Accordion.Trigger>
        </Accordion.Header>
        <Accordion.Content>body</Accordion.Content>
      </Accordion.Item>
    </Accordion.Root>
  );
}

describe('Accordion.Header — 제목 수준 (WCAG 1.3.1 문서 구조)', () => {
  it('기본은 h3 이다 (하위 호환)', () => {
    render(<One />);
    expect(screen.getByRole('heading', { level: 3 })).toContainElement(screen.getByText('A'));
  });

  it.each([1, 2, 4, 6] as const)('level=%i 를 같은 수준의 h 태그로 렌더링한다', (level) => {
    render(<One level={level} />);
    const heading = screen.getByRole('heading', { level });
    expect(heading.tagName).toBe(`H${level}`);
  });

  it('범위를 벗어난 level(타입 우회 입력)은 h3 으로 대체한다 (경계)', () => {
    // Untrusted JS input bypassing the type: 0, 7 and NaN must not render <h0>/<h7>.
    for (const bad of [0, 7, Number.NaN]) {
      const { container, unmount } = render(<One level={bad as 3} />);
      expect(container.querySelector('h3')).not.toBeNull();
      unmount();
    }
  });

  it('Item 밖의 Header 는 명확한 에러로 거부한다 (오용)', () => {
    expect(() =>
      render(
        <Accordion.Root type="single">
          <Accordion.Header>x</Accordion.Header>
        </Accordion.Root>,
      ),
    ).toThrow();
  });
});

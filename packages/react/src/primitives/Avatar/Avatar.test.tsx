import { act, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Avatar } from './Avatar';

describe('Avatar', () => {
  it('renders the fallback while the image has not loaded', () => {
    render(
      <Avatar.Root>
        <Avatar.Image src="https://example.com/x.png" alt="" />
        <Avatar.Fallback>AB</Avatar.Fallback>
      </Avatar.Root>,
    );
    expect(screen.getByText('AB')).toBeInTheDocument();
  });

  it('does not render the <img> tag while loading', () => {
    render(
      <Avatar.Root>
        <Avatar.Image src="https://example.com/x.png" alt="alt" />
        <Avatar.Fallback>AB</Avatar.Fallback>
      </Avatar.Root>,
    );
    // Radix-style: <img> is only mounted once `loaded`. While loading there is no img tag.
    expect(screen.queryByAltText('alt')).toBeNull();
  });

  it('renders fallback when no src is provided (error state)', () => {
    render(
      <Avatar.Root>
        <Avatar.Image alt="" />
        <Avatar.Fallback>AB</Avatar.Fallback>
      </Avatar.Root>,
    );
    expect(screen.getByText('AB')).toBeInTheDocument();
  });

  describe('delayMs', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });
    afterEach(() => {
      vi.useRealTimers();
    });

    it('delays showing the fallback until delayMs elapses', () => {
      render(
        <Avatar.Root>
          <Avatar.Image src="https://example.com/x.png" alt="" />
          <Avatar.Fallback delayMs={500}>AB</Avatar.Fallback>
        </Avatar.Root>,
      );

      expect(screen.queryByText('AB')).not.toBeInTheDocument();

      act(() => {
        vi.advanceTimersByTime(500);
      });

      expect(screen.getByText('AB')).toBeInTheDocument();
    });
  });
});

import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Menubar } from './Menubar';

describe('Menubar', () => {
  it('renders role=menubar and opens a single menu at a time', () => {
    render(
      <Menubar.Root>
        <Menubar.Menu value="file">
          <Menubar.Trigger>File</Menubar.Trigger>
          <Menubar.Portal>
            <Menubar.Content>
              <Menubar.Item>Open</Menubar.Item>
            </Menubar.Content>
          </Menubar.Portal>
        </Menubar.Menu>
        <Menubar.Menu value="edit">
          <Menubar.Trigger>Edit</Menubar.Trigger>
          <Menubar.Portal>
            <Menubar.Content>
              <Menubar.Item>Copy</Menubar.Item>
            </Menubar.Content>
          </Menubar.Portal>
        </Menubar.Menu>
      </Menubar.Root>,
    );

    expect(screen.getByRole('menubar')).toBeInTheDocument();
    fireEvent.click(screen.getByText('File'));
    expect(screen.getByText('Open')).toBeInTheDocument();
  });
});

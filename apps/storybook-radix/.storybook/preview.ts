import type { Preview } from '@storybook/react-vite';

import '@gugbab-ui/styled-radix/styles.css';

type ColorScheme = 'light' | 'dark';

function applyTheme(theme: ColorScheme) {
  if (typeof document === 'undefined') return;
  document.documentElement.setAttribute('data-theme', theme);
  document.documentElement.style.colorScheme = theme;
}

const preview: Preview = {
  globalTypes: {
    theme: {
      name: 'Theme',
      description: 'Color scheme',
      defaultValue: 'light',
      toolbar: {
        icon: 'circlehollow',
        title: 'Theme',
        items: [
          { value: 'light', title: 'Light' },
          { value: 'dark', title: 'Dark' },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: {
    theme: 'light',
  },
  parameters: {
    layout: 'centered',
    options: {
      storySort: {
        order: [
          'Welcome',
          'Foundations',
          ['Colors', 'Typography', 'Spacing', 'Radius', 'Shadows'],
          'Primitives',
          'Stateful',
          'Forms',
          'Overlays',
          'Menus',
          'Navigation',
          'Misc',
        ],
      },
    },
    backgrounds: { disable: true },
    a11y: { test: 'todo' },
    docs: {
      toc: true,
    },
  },
  decorators: [
    (Story, ctx) => {
      const theme = (ctx.globals.theme as ColorScheme) ?? 'light';
      applyTheme(theme);
      return Story();
    },
  ],
};

export default preview;

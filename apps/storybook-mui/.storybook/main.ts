import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  stories: ['../stories/**/*.stories.@(ts|tsx)'],
  addons: ['@storybook/addon-docs', '@storybook/addon-a11y', '@storybook/addon-themes'],
  typescript: {
    check: false,
    reactDocgen: 'react-docgen-typescript',
  },
  docs: {
    defaultName: 'Docs',
  },
};

export default config;

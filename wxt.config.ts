import { defineConfig } from 'wxt';

process.env.CHOKIDAR_USEPOLLING = '1';

export default defineConfig({
  srcDir: 'src',
  imports: false,
  manifest: {
    name: 'Simple Mouse Gestures',
    description:
      'Extension that provides the ability to define mouse gestures that will run specific actions in your Google Chrome browser',
    version_name: '0.9.0 beta',
    author: { email: 'lukasz.rydzkowski@gmail.com' },
    icons: {
      16: 'images/icon-16.png',
      32: 'images/icon-32.png',
      48: 'images/icon-48.png',
      128: 'images/icon-128.png',
    },
    permissions: ['scripting', 'storage', 'sessions'],
    host_permissions: ['<all_urls>'],
  },
  zip: {
    artifactTemplate: '{{name}}-{{packageVersion}}-{{browser}}.zip',
  },
  vite: () => ({
    build: {
      minify: false,
    },
  }),
});

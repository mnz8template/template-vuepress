import { defineUserConfig, defaultTheme } from 'vuepress';
import sidebarPlugin from './plugins/register-sidebar';

export default defineUserConfig({
  theme: defaultTheme({
    navbar: false,
  }),

  plugins: [sidebarPlugin()],
});

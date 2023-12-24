import { defineUserConfig, defaultTheme } from 'vuepress';
import sidebarPlugin from './plugins/register-sidebar';
import { getDirname, path } from '@vuepress/utils';

const __dirname = getDirname(import.meta.url);

export default defineUserConfig({
  theme: defaultTheme({
    navbar: false,
    // sidebar: 'auto',
  }),

  plugins: [sidebarPlugin()],
  // pagePatterns 默认值 ['**/*.md', '!.vuepress', '!node_modules']
  // 使用 ['**/*.md', '!**/README.md', '!.vuepress', '!node_modules'] 来排除所有的 README.md 文件。
  // pagePatterns: [],

  // 覆盖组件别名 调试用
  // alias: {
  //   // 调试用
  //   '@theme/SidebarItems.vue': path.resolve(__dirname, './components/SidebarItems.vue'),
  // },
});

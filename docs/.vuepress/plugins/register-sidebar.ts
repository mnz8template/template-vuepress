import chokidar from 'chokidar';
import { createPage } from '@vuepress/core';
import type { App, Plugin, Page, SidebarConfig, SidebarConfigArray, SidebarGroup } from 'vuepress';

/**
 * sidebar 的两种设置方式
 *
 * themes\theme-default\src\client\composables\useSidebarItems.ts resolveSidebarItems
 * const sidebarConfig = frontmatter.sidebar ?? themeLocale.sidebar ?? 'auto'
 *
 * frontmatter
 * 通过设置 pageData.frontmatter 实现
 *
 * themeLocale
 * plugins\plugin-theme-data\src\node\prepareThemeData.ts
 * 通过 app.writeTemp('internal/themeData.js', content) 实现
 *
 * 这里采用 pageData.frontmatter
 */
const sidebarPlugin = (sidebarCallback: SidebarCallback = sidebarGenerate): Plugin => {
  return {
    name: 'vuepress-plugin-bar',

    // 初始化之后，所有的页面已经加载完毕
    async onInitialized(app) {
      // 如果没有主页，增加默认主页
      // https://github.com/vuepress/docs/blob/06559c9327cbbd7ab5a93c632d4a3992b4c5ddd8/docs/zh/advanced/cookbook/adding-extra-pages.md
      if (app.pages.every((page) => page.path !== '/')) {
        // 创建一个主页
        const homepage = await createPage(app, {
          path: '/',
          // 设置 frontmatter
          frontmatter: {
            layout: 'Layout',
          },
          // 设置 markdown 内容
          content: `\# 默认主页`,
        });
        // 把它添加到 `app.pages`
        app.pages.push(homepage);
      }

      const pages = app?.pages || [];
      const sidebar = sidebarCallback(pages);
      console.dir(sidebar, { depth: null });
      pages.forEach((page) => {
        page.data.frontmatter.sidebar = sidebar;
      });
    },

    async onWatched(app: App, watchers, restart: () => Promise<void>) {
      // watch page files
      const pagesWatcher = chokidar.watch(app.options.pagePatterns, {
        cwd: app.dir.source(),
        ignoreInitial: true,
      });

      pagesWatcher.on('add', async (filePathRelative) => {
        restart();
      });

      pagesWatcher.on('change', async (filePathRelative) => {
        restart();
      });

      pagesWatcher.on('unlink', async (filePathRelative) => {
        restart();
      });

      watchers.push(pagesWatcher);
    },
  };
};

export default sidebarPlugin;

function sidebarGenerate(pageArray: Page[]): SidebarConfig {
  const temp: SidebarConfigArray | SidebarConfigArray[number] = [];

  for (const page of pageArray) {
    const path = page.filePathRelative;
    if (path) {
      const path_absolute = '/' + path;
      const path_ele = path.split('/');

      if (path_ele.length < 2) {
        temp.push({ text: textGenerate(path), link: path_absolute });
      } else {
        let current = temp;
        let end_segment = path_ele[path_ele.length - 1];

        while (path_ele.length > 1) {
          const segment = path_ele.shift() || '';
          const text = textGenerate(segment);
          const index = current.findIndex((ele) => segment && typeof ele !== 'string' && ele?.text === text);

          if (index === -1) {
            current.push({
              text,
              children: [],
              collapsible: true,
            });

            current = (current[current.length - 1] as SidebarGroup).children;
          } else {
            // @ts-ignore
            if (!current[index]?.children) {
              current[index]['children'] = [];
            }
            current = current[index].children;
          }
        }

        if (Array.isArray(current)) {
          current.push({ text: textGenerate(end_segment), link: path_absolute, collapsible: true });
        }
      }
    }
  }

  return temp;
}

function textGenerate(s: string) {
  return (s.charAt(0).toUpperCase() + s.slice(1)).replace(/.md$/, '');
}

export interface SidebarCallback {
  (pageArray: Page[]): SidebarConfig;
}

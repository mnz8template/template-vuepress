import chokidar from 'chokidar';
import { globby } from '@vuepress/utils';
import { inferPagePath } from './fork/inferPagePath';
import { resolvePagePath } from './fork/resolvePagePath';
import { resolvePageHtmlInfo } from './fork/resolvePageHtmlInfo';
import { resolvePageFilePath } from './fork/resolvePageFilePath';
import type { App, PageOptions, Plugin, Page, SidebarConfig, SidebarConfigArray, SidebarGroup } from 'vuepress';
import type { FSWatcher } from 'chokidar';

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
const sidebarPlugin = (callback: Callback = defaultCallback): Plugin => {
  // permalink 没有做处理
  return (app: App) => {
    return {
      name: 'vuepress-plugin-bar',
      extendsPage: async (page: Page<SidebarPluginPageData>) => {
        const pathArray = await getSidebarFromPageFiles(app);
        const pathResult = callback(pathArray);
        // 覆盖 frontmatter.sidebar
        page.data.frontmatter.sidebar = pathResult;
      },
      onWatched: watchPageFiles,
    };
  };
};

export default sidebarPlugin;

// fork vuepress packages\cli\src\commands\dev\watchPageFiles.ts
export const watchPageFiles = (app: App, watchers: FSWatcher[]) => {
  // watch page files
  const pagesWatcher = chokidar.watch(app.options.pagePatterns, {
    cwd: app.dir.source(),
    ignoreInitial: true,
  });

  // 多文件会存在问题
  pagesWatcher.on('add', async (filePathRelative) => {
    console.log('add', filePathRelative);
  });

  pagesWatcher.on('unlink', async (filePathRelative) => {
    console.log('unlink', filePathRelative);
  });

  watchers.push(pagesWatcher);
};

// fork vuepress packages\core\src\app\resolveAppPages.ts
const getSidebarFromPageFiles = async (app: App): Promise<PathCollection[]> => {
  const pageFilePaths = await globby(app.options.pagePatterns, {
    absolute: true,
    cwd: app.dir.source(),
  });

  const pathArray = pageFilePaths.map((filePath) => createPage(app, { filePath }));
  return pathArray;
};

function createPage(app: App, options: PageOptions): PathCollection {
  // resolve page file absolute path and relative path
  const { filePath, filePathRelative } = resolvePageFilePath({
    app,
    options,
  });

  // infer page path according to file path
  const { pathInferred, pathLocale } = inferPagePath({ app, filePathRelative });

  // permalink 情况增加消耗，不处理 permalink 相关
  // resolve page path
  const path = resolvePagePath({ permalink: null, pathInferred, options });

  // resolve page rendered html file path
  const { htmlFilePath, htmlFilePathRelative } = resolvePageHtmlInfo({
    app,
    path,
  });

  return { filePath, filePathRelative, pathInferred, pathLocale, htmlFilePath, htmlFilePathRelative };
}

/**
 * 统计各类 path
 * filePath
 * filePathRelative
 * pathInferred
 * pathLocale 多语言
 * htmlFilePath
 * htmlFilePathRelative
 */
interface PathCollection {
  filePath: string | null;
  filePathRelative: string | null;
  pathInferred: string | null;
  pathLocale: string;
  htmlFilePath: string;
  htmlFilePathRelative: string;
}

interface Callback {
  (pathArray: PathCollection[]): SidebarConfig;
}

function defaultCallback(pathArray: PathCollection[]): SidebarConfig {
  const temp: SidebarConfigArray | SidebarConfigArray[number] = [];

  for (const pathMap of pathArray) {
    let path = pathMap.filePathRelative || '';
    const path_absolute = '/' + path;
    let path_ele = path.split('/');

    if (path_ele.length < 2) {
      temp.push({ text: path.charAt(0).toUpperCase() + path.slice(1), link: path_absolute });
    } else {
      let current = temp;
      let end_segment = path_ele[path_ele.length - 1];

      while (path_ele.length > 1) {
        const segment = path_ele.shift() || '';
        const text = segment.charAt(0).toUpperCase() + segment.slice(1);
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
          if (current[index]?.children) {
            // @ts-ignore
            current = current[index].children;
          } else {
            current = current[index];
          }
        }
      }

      if (Array.isArray(current)) {
        current.push({ text: end_segment.charAt(0).toUpperCase() + end_segment.slice(1), link: path_absolute, collapsible: true });
      }
    }
  }

  return temp;
}

export interface SidebarPluginPageData {
  sidebarItemsFromPlugin: SidebarConfigArray;
}